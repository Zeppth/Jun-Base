// ./library/db.js

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const $res = {
    error: (...values) => {
        console.error(...values);
        return false;
    },
};

const $randomId = (number = 4) => crypto
    .randomBytes(number).toString('hex')
    .toUpperCase();

const sfs = {
    has: async ($path) => await fs.access($path)
        .then(() => true).catch(() => false),
    get: async ($path) => await fs.readFile($path, 'utf-8')
        .then((content) => JSON.parse(content.trim()))
        .catch(() => (false)),
    set: async ($path, data) => await fs.writeFile($path, data)
        .then(() => true).catch((e) => $res
            .error('Error writing file:', e)),
    delete: async ($path) => await fs.unlink($path)
        .then(() => true).catch(() => false),
};

const folder = async (folder) => {
    if (!folder) return $res
        .error('Folder not set');
    await fs.mkdir(folder,
        { recursive: true });
    return {
        has: async (file) => sfs.has(path
            .join(folder, file)),
        get: async (file) => sfs.get(path
            .join(folder, file)),
        delete: async (file) => sfs.delete(path
            .join(folder, file)),
        set: async (file, data = {}) => sfs.set(path
            .join(folder, file), JSON.stringify
            (data, null, 2)),
    };
};

const $data = {
    folder: false,
    bases: new Map(),
    timeouts: new Map(),
    async index() {
        if (!$data.folder) return $res
            .error('Folder not set');
        if (!await this.folder.has('index.json'))
            await this.folder.set('index.json');
        const file = await this.folder
            .get('index.json');
        return {
            data: file, update: async () => {
                if (!this.folder) return $res
                    .error('Folder not set');
                return await this.folder
                    .set('index.json', file);
            }
        };
    }
};

export default {
    async Start($folder) {
        if (!$folder) return $res
            .error('Folder path not set');
        $data.folder = await folder($folder || './data');
        $data.index = await $data.index();
        return this;
    },
    async has(name) {
        if (!$data.folder) return $res
            .error('Folder not set');
        if (typeof name !== 'string') return $res
            .error('Name must be a string');
        return $data.bases.has(name)
            || !!$data.index.data[name];
    },
    async open(name) {
        if (!$data.folder) return $res
            .error('Folder not set');
        if (typeof name !== 'string') return $res
            .error('Name must be a string');

        if ($data.bases.has(name)) {
            if ($data.timeouts.has(name)) $data
                .timeouts.get(name).start();
            return $data.bases.get(name);
        }

        let file;
        if ($data.index.data[name]) {
            const base = $data.index.data[name];
            if (!await $data.folder.has(base.id + '.json'))
                await $data.folder.set(base.id + '.json');
            file = await $data.folder.get(base.id + '.json');
        } else {
            const id = $randomId(4);
            $data.index.data[name] = { id };
            await $data.folder.set(id + '.json');
            await $data.index.update();
            file = {};
        }

        $data.bases.set(name, {
            data: file,
            async update() {
                return await $data.folder
                    .set($data.index.data[name]
                        .id + '.json', this.data);
            }
        });

        const timer = new SetTimeout(() => {
            $data.bases.delete(name);
            $data.timeouts.delete(name);
        }, 60_000);

        timer.start();
        $data.timeouts
            .set(name,
                timer);

        return $data.bases
            .get(name);
    },
    async delete(name) {
        if (!$data.folder) return $res
            .error('Folder not set');
        if (typeof name !== 'string') return $res
            .error('Name must be a string');
        if (!$data.index.data[name]) return $res
            .error('Database not found');
        const data = $data.index.data[name];
        if ($data.bases.has(name)) $data.bases.delete(name);
        if ($data.timeouts.has(name)) {
            $data.timeouts.get(name).stop();
            $data.timeouts.delete(name);
        }
        if (await $data.folder.has(data.id + '.json')) await $data
            .folder.delete(data.id + '.json');
        delete $data.index.data[name];
        await $data.index.update();
        return true;
    },
};

class SetTimeout {
    constructor(handler, timeout) {
        this.handler = handler;
        this.timeout = timeout;
        this.running = false;
        this.timer = null;
    }

    start() {
        this.stop();
        this.running = true;
        this.timer = setTimeout(async () => {
            await this.handler();
            this.running = false;
        }, this.timeout);
    }

    stop() {
        if (!this.timer) return;
        clearTimeout(this.timer);
        this.running = false;
        this.timer = null;
    }

    status() {
        return this.running
            ? 'running'
            : 'stopped';
    }
}
