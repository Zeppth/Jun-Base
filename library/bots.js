import crypto from 'crypto';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import handlerLoader from './loader.js';
import { MakeClient } from './client.js';

const Id = (n = 4) =>
    crypto.randomBytes(n)
        .toString('hex')
        .toUpperCase();

export class SubBots {
    constructor(basePath, plugins) {
        this.plugins = plugins;
        this.basePath = basePath;
        this.bots = new Map();
        this._db = null;
    }

    async getDB() {
        const db = global.db
        return await db.open('subBots');
    }

    #CrIn(slot, options, botData = {}) {
        const client = new MakeClient({
            syncFullHistory: false,
            fireInitQueries: false,
            getMessage: async () => null
        });

        return {
            slot,
            options,
            bot: client,
            events: new EventEmitter(),
            status: 'disconnected',
            ownerId: botData.ownerId || null,
            ownerNumber: botData.ownerNumber || null,
            ownerName: botData.ownerName || null,
            startTime: null,
            uptime: () => this.startTime
                ? Date.now() - this.startTime : 0,
            run: (opts = {}) => client.start({
                ...options, ...opts
            }),
            stop: () => client.stop(),
            restart: () => client.restart(),
            logged: () => client.logged(),
            db: async () => {
                const db = await this.getDB();
                return {
                    data: db.data[slot],
                    update: db.update,
                    _data: db.data
                };
            }
        };
    }

    async get(slot) {
        if (this.bots.has(slot))
            return this.bots.get(slot);
        const db = await this.getDB();
        const data = db.data[slot];
        if (!data) return null;

        const options = JSON.parse(data.options || '{}');
        const instance = this.#CrIn(slot, options, data);
        if (data.status !== 'disconnected') {
            data.status = 'disconnected';
            await db.update();
        }

        this.bots.set(slot, instance);
        return instance;
    }


    async start(any = { connectType: 'qr-code' }) {
        let slot, options, isNew = false;

        if (typeof any === 'string') {
            slot = any;
            const existing = await this.get(slot);
            if (!existing) return null;
            options = existing.options;
        } else {
            isNew = true;
            options = {};
            slot = `slot-${Id()}`;
            options.folderPath = path
                .join(this.basePath, slot);
            Object.assign(options, any)
        }

        const subBot = isNew ? this.#CrIn(
            slot, options, {
            ownerId: any.ownerId || null,
            ownerNumber: any.ownerNumber || null,
            ownerName: any.ownerName || null,
        }) : await this.get(slot);

        this.bots.set(slot, subBot);

        subBot.bot.events.on('messages', async (m) => {
            try {
                const sock = subBot.bot.sock;
                if (!sock.subBot) sock.subBot = true;
                if (!sock.plugins) sock.plugins = this.plugins;
                if (!sock.subBotSlot) sock.subBotSlot = slot;
                if (!sock.subBotOwnerId) sock.subBotOwnerId = subBot.ownerId;
                if (!sock.subBotOwnerNumber) sock.subBotOwnerNumber = subBot.ownerNumber;
                if (!sock.subBotOwnerName) sock.subBotOwnerName = subBot.ownerName;

                const handler = handlerLoader.get('core.handler.js');
                if (handler) await handler.default(m, sock);
            } catch (e) {
                console.error(`[Error Mensajes ${slot}]:`, e);
            }
        });

        subBot.bot.events.on('connection', async (update) => {
            subBot.events.emit('connection', update);

            const db = await this.getDB();
            const { type, data } = update;

            db.data[slot] ||= {};

            if (type === 'open') {

                //////////////////////////
                const _data = db.data[slot];
                _data.options = JSON.stringify(options);
                _data.connectedAt = new Date().toISOString();
                _data.ownerId ||= any.ownerId || null
                _data.ownerNumber ||= any.ownerNumber || null
                _data.ownerName ||= any.ownerName || null
                _data.status = 'connected';
                _data.info = data;

                ///////////////////////////
                subBot.status = 'connected';
                subBot.startTime = Date.now();
            }

            else if (type === 'close' || type === 'replaced') {
                this.bots.delete(slot);
                delete db.data[slot];
                subBot.status = 'disconnected';
            }

            else if (type === 'restart' || type === 'error') {
                subBot.status = 'reconnecting';
                db.data[slot].status = 'reconnecting';
            }

            if (type === 'error') {
                const now = Date.now();
                const last = new Date(db.data[slot].lastDisconnectedAt || 0).getTime();

                if (now - last > 3600000) db.data[slot].points = 0;
                if (last > 0 && (now - last) < 300000)
                    db.data[slot].points = (db.data[slot].points || 0) + 1;

                db.data[slot].status = 'disconnected';
                db.data[slot].lastDisconnectedAt = new Date().toISOString();
                subBot.status = 'disconnected';

                if (db.data[slot].points >= 5) {
                    console.error(`[SubBot ${slot}] Auto-eliminado por inestabilidad.`);
                    await this.delete(slot);
                    return;
                }
            }

            await db.update();
        });

        subBot.run(typeof any === 'string'
            ? { connectType: 'qr-code' } : {});

        return subBot;
    }

    async stop(slot) {
        const sub = await this.get(slot);
        if (!sub) return false;
        sub.bot.events.removeAllListeners();
        sub.events.removeAllListeners();
        await sub.stop();
        const db = await this.getDB();
        if (db.data[slot]) {
            db.data[slot].status = 'disconnected';
            await db.update();
        }
        return true;
    }

    async delete(slot) {
        const sub = await this.get(slot);
        if (!sub) return false;

        try {
            await sub.logged();
            await sub.stop();
            const db = await this.getDB();
            delete db.data[slot];
            await db.update();
            this.bots.delete(slot);
            const folder = this.basePath + '/' + slot;
            const exists = await fs.access(folder)
                .then(() => true).catch(() => false);
            if (exists) await fs.rm(folder, {
                recursive: true, force: true
            }).catch(() => { })
            return true;
        } catch (e) {
            console.error(`[Delete Error ${slot}]:`, e);
            return false;
        }
    }

    async restart(slot) {
        const sub = await this.get(slot);
        return sub ? await sub.restart() : false;
    }

    async list() {
        const db = await this.getDB();
        return Object.keys(db.data);
    }

    async startAll() {
        const db = await this.getDB();
        const slots = Object.keys(db.data);
        for (const slot of slots) {
            if (db.data[slot].status === 'connected') continue;
            try {
                await this.start(slot);
                await new Promise(r =>
                    setTimeout(r, 2000));
            } catch (e) {
                console.error(`[Error StartAll ${slot}]:`, e);
                continue;
            }
        }
    }

    get Map() { return this.bots; }
}