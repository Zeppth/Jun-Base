
import {
    Browsers,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';

import bind from './bind.js';
import { EventEmitter } from 'events';
import makeWASocket from '@whiskeysockets/baileys';
import qrTerminal from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import qrCode from 'qrcode';
import pino from 'pino';

const { version } = await fetchLatestBaileysVersion();

const CONNECTION = {
    version: version,
    emitOwnEvents: true,
    fireInitQueries: false,
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    retryRequestDelayMs: 5000,
    keepAliveIntervalMs: 30000,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    patchMessageBeforeSending: (message) => {
        const UintArray = (numero) => Uint8Array
            .from(randomBytes(numero));
        message.messageContextInfo ||= {};
        const info = message.messageContextInfo;
        info.messageSecret ||= UintArray(32);
        info.threadId ||= [];
        return message;
    },
    transactionOpts: {
        maxCommitRetries: 5,
        delayBetweenTriesMs: 5000
    },
    appStateMacVerification: {
        patch: true,
        snapshot: true
    },
}

async function StartBot(object) {
    object.connectOptions = {
        ...CONNECTION, ...(object.connectOptions || {})
    }

    if (!object.folderPath) object.folderPath = './storage/creds'
    if (!object.connectType) object.connectType = 'qr-code'
    await fs.mkdir(object.folderPath, { recursive: true });

    let { state, saveCreds } = await useMultiFileAuthState(object.folderPath)
    const keyStore = makeCacheableSignalKeyStore(state.keys,
        pino({ level: "fatal" }).child({ level: "fatal" }))

    const sockConfig = {
        ...object.connectOptions
    }

    sockConfig.auth = {
        creds: state.creds,
        keys: keyStore
    }

    if (object.connectType == 'qr-code') {
        sockConfig.browser = Browsers.macOS('Desktop')
    }

    const sock = makeWASocket(sockConfig);

    sock.ev.on('creds.update', saveCreds);

    if (object.connectType == 'pin-code') {
        let numero = object.phoneNumber.replace(/\D/g, '')
        await new Promise(resolve => setTimeout(resolve, 3000));
        const pairingCode = await sock.requestPairingCode(numero,
            object.customCode ?? null);
        const data = {
            pairingCode: pairingCode,
            formattedCode: pairingCode
                .match(/.{1,4}/g)?.join("-") ??
                pairingCode
        }
        object.events.emit('connection', {
            type: 'pairing',
            event: 'pin-code',
            data: data
        })
    }

    Object.assign(sock, await bind(sock));

    sock.ev.on('messages.upsert', async (m) => {
        object.events.emit('messages', m)
    });

    sock.ev.on('connection.update', async (update) => {
        const { lastDisconnect, connection, qr } = update;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode || "error";

            if ([
                DisconnectReason.restartRequired, DisconnectReason.connectionLost,
                DisconnectReason.connectionClosed, DisconnectReason.unavailableService,
                DisconnectReason.timedOut
            ].includes(reason)) {
                object.events.emit('connection', { type: 'restart', reasonCode: reason });
                if (reason === DisconnectReason.unavailableService)
                    await new Promise(resolve => setTimeout(resolve, 5000));
                await StartBot({ ...object, connectType: 'qr-code' })
            }

            else if ([
                DisconnectReason.loggedOut, DisconnectReason.badSession,
                DisconnectReason.multideviceMismatch, DisconnectReason.forbidden
            ].includes(reason)) {
                sock.ev.removeAllListeners();
                sock.end(undefined);
                object.events.emit('connection', { type: 'closed', reasonCode: reason });
                const exists = await fs.access(object.folderPath)
                    .then(() => true).catch(() => false);
                if (exists) await fs.rm(object.folderPath, {
                    recursive: true, force: true
                });
                object.resolve(null);
                return;
            }

            else if (reason === DisconnectReason.connectionReplaced) {
                object.events.emit('connection',
                    { type: 'replaced', reasonCode: reason });
                sock.ev.removeAllListeners();
                sock.end(undefined);
                object.resolve(null);
                return;
            } else {
                object.events.emit('connection', {
                    type: 'error', reasonCode: reason, ...(lastDisconnect || {})
                });
                await new Promise(resolve => setTimeout(resolve, 5000));
                await StartBot({ ...object, connectType: 'qr-code' })
            }
        }

        if (connection === 'open') {
            const data = {
                ...sock.user,
                lid: sock.user.lid.split(":")[0]
                    + "@lid",
                id: sock.user.id.split(":")[0]
                    + "@s.whatsapp.net"
            }
            object.events.emit('connection', {
                type: 'open', data
            });

            object.resolve(sock);
            return;
        }

        if (qr) {
            const data = {
                rawQrCode: qr,
                qrCodeImage: await qrCode.toDataURL(qr),
                qrCodeText: await new Promise((resolve) =>
                    qrTerminal.generate(qr, { small: true },
                        (qrCode) => resolve(qrCode)))
            }
            object.events.emit('connection', {
                type: 'pairing',
                event: 'qr-code',
                data
            })
        }
    })
}

export class MakeClient {
    constructor(connection) {
        this.events = new EventEmitter()
        this.connection = {
            ...CONNECTION,
            ...connection
        }
    }

    async start(options) {
        this.sock = await new Promise(
            async resolve => await StartBot({
                connectOptions: this.connection,
                ...options, events: this.events,
                resolve
            }))

        return this.sock;
    }

    async stop() {
        if (!this.sock) return;
        await this.sock?.ev?.removeAllListeners();
        await this.sock?.end(undefined);
        this.sock = null;
    }

    async restart() {
        if (!this.sock) return;
        else this.stop();
        await new Promise(resolve =>
            setTimeout(resolve, 2000));
        return await this.start({
            connectType: 'qr-code'
        });
    }

    async logged() {
        if (!this.sock) return;
        await this.sock.logout();
        await this.stop();
        return true;
    }
}