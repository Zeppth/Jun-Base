/*
 * -----------------------------------------------------------------------------------
 * JunDB es una mierda para proyectos grandes.
 * Esta DB es súper básica y solo está aquí para que el bot funcione rápido al inicio.
 * Si tu proyecto se vuelve pesado o serio, usa una base de datos de verdad
 * (PostgreSQL, MongoDB, etc.). JunDB no aguantará cosas pesadas.
 * -----------------------------------------------------------------------------------
 */

// ./library/db.js
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

class Memory {
    constructor(limitMB = 15, ttlSeconds = 30) {
        this.limit = limitMB * 1024 * 1024;
        this.ttl = ttlSeconds * 1000;
        this.cells = new Map();
        this.currentSize = 0;
    }

    #size(data) {
        return Buffer.byteLength(
            JSON.stringify(data));
    }

    set(key, data) {
        if (this.cells.has(key))
            this.delete(key);

        const size = this.#size(data);
        if (size > this.limit) return;
        while (this.currentSize + size
            > this.limit && this.cells.size > 0) {
            const oldestKey = this.cells
                .keys().next().value;
            this.delete(oldestKey);
        }

        const timer = setTimeout(() =>
            this.delete(key), this.ttl);
        this.cells.set(key,
            { data, size, timer });
        this.currentSize += size;
    }

    get(key) {
        const cell = this.cells.get(key);
        if (!cell) return null;
        const data = cell.data;
        this.set(key, data);
        return cell.data;
    }

    delete(key) {
        const cell = this.cells.get(key);
        if (cell) {
            clearTimeout(cell.timer);
            this.currentSize -= cell.size;
            this.cells.delete(key);
        }
    }

    has(key) {
        return this.cells.has(key);
    }
}


class Folder {
    constructor(options = {}) {
        options = {
            folder: './data',
            memoryLimit: 15,
            memoryTTL: 30,
            ...options
        }

        this.basePath = path.resolve(
            options.folder);
        this.RAM = new Memory(
            options.memoryLimit,
            options.memoryTTL);
        this.Pipe = new Map();
    }

    async #pipe(filename, action) {
        const next = (this.Pipe.get(filename) || Promise.resolve())
            .then(() => action().catch(() => null)).finally(() =>
                this.Pipe.get(filename) === next &&
                this.Pipe.delete(filename));
        return this.Pipe.set(filename,
            next).get(filename);
    }

    async init() {
        await fs.mkdir(this.basePath,
            { recursive: true });
        return this;
    }

    async read(filename) {
        const cached = this.RAM.get(filename);
        if (cached) return cached;
        return this.#pipe(filename, async () => {
            const filePath = path.join(this.basePath, filename);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            this.RAM.set(filename, data);
            return data;
        });
    }

    async write(filename, data = {}) {
        return this.#pipe(filename, async () => {
            const filePath = path.join(this.basePath, filename);
            const tempPath = filePath + '.tmp';
            await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
            await new Promise(resolve => setTimeout(resolve, 500));
            await fs.rename(tempPath, filePath);
            this.RAM.set(filename, data);
            return true;
        });
    }

    async remove(filename) {
        return this.#pipe(filename, async () => {
            const filePath = path.join(this.basePath, filename);
            await fs.rm(filePath, { recursive: true, force: true });
            this.RAM.delete(filename);
            return true;
        });
    }

    async exists(filename) {
        if (this.RAM.has(filename)) return true;
        return fs.access(path.join(this.basePath, filename))
            .then(() => true).catch(() => false);
    }
}

class DB {
    constructor(storage, filename, data = {}) {
        if (storage instanceof Folder) {
            this.storage = storage;
        } else {
            const options = typeof storage === 'string'
                ? { folder: storage } : storage;
            this.storage = new Folder(options);
        }

        this.state = { timer: null, count: 0 };
        this.name = filename;
        this.data = data
    }

    async read() {
        if (await this.storage.exists(this.name)) {
            this.data = await this.storage.read(this.name);
        } else {
            await this.storage.write(this.name, this.data);
        }
        return this.data;
    }

    async #commit() {
        this.state.count = 0;
        if (this.state.timer) clearTimeout(this.state.timer);
        this.state.timer = null;
        return await this.storage.write(this.name, this.data);
    }

    async update() {
        this.state.count++;
        if (this.state.timer) clearTimeout(this.state.timer);
        if (this.state.count >= 5) return await this.#commit();
        this.state.timer = setTimeout(() => this.#commit(), 5000);
        return true;
    }

    async remove() {
        if (this.state.timer) clearTimeout(this.state.timer);
        return await this.storage.remove(this.name);
    }
}

class JunDB {
    constructor() {
        this.index = null;
        this.storage = null;
        this.active = new Map();
        this.timers = new Map();
    }

    async init(options = {}) {
        this.storage = new Folder(options);
        await this.storage.init();
        this.index = new DB(this
            .storage, 'index.json');
        await this.index.read();
        return this;
    }


    #Idle(name) {
        if (this.timers.has(name))
            clearTimeout(this.timers.get(name));
        const timer = setTimeout(async () => {
            const db = this.active.get(name);
            if (db && db.state.timer) {
                return this.#Idle(name);
            } else if (!db) return
            this.active.delete(name);
            this.timers.delete(name);
        }, 60000);

        this.timers.set(
            name, timer);
    }

    async has(name) {
        return !!this.index.data[name];
    }

    async open(name) {
        if (this.active.has(name)) {
            this.#Idle(name);
            return this.active
                .get(name);
        }

        let id;
        if (this.index.data[name]) {
            id = this.index.data[name].id;
        } else {
            id = crypto.randomBytes(2)
                .toString('hex').toUpperCase();
            this.index.data[name] = { id };
            await this.index.update();
        }

        const db = new DB(this
            .storage, `${id}.json`);
        await db.read();

        this.active
            .set(name, db);
        this.#Idle(name);
        return db;
    }

    async delete(name) {
        if (!this.index.data[name]) return false;
        if (this.timers.has(name)) {
            clearTimeout(this.timers.get(name));
            this.timers.delete(name);
        }

        const db = await this.open(name);
        await db.remove();

        this.active.delete(name);
        delete this.index.data[name];
        await this.index.update();
        return true;
    }

    list() {
        return Object.keys(
            this.index.data)
    }
}

export { JunDB, DB }

