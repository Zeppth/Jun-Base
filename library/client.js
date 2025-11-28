// ./library/client.js

import {
    Browsers,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';
//import node_cache from 'node-cache';
import $process from './process.js';
import { randomBytes } from 'crypto';
import pino from 'pino';

import makeWASocket from '@whiskeysockets/baileys';

const { proto } = (await import('@whiskeysockets/baileys')).default;

export async function MakeBot(conn = {
    connectType: 'qr-code',
    phoneNumber: ''
}, store) {
    const _path = $process.env.path
    //const msgRetryCounterCache = new node_cache()
    let { state, saveCreds } = await useMultiFileAuthState(_path.creds)
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const connection = {
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        emitOwnEvents: true,
        fireInitQueries: true,
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        retryRequestDelayMs: 5000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        //msgRetryCounterCache,
        appStateMacVerification: {
            patch: true,
            snapshot: true
        },
        transactionOpts: {
            maxCommitRetries: 5,
            delayBetweenTriesMs: 5000
        },
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys,
                pino({ level: "fatal" }).child({ level: "fatal" }))
        },
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return { conversation: "hello" }
        },
        patchMessageBeforeSending: (message) => {
            const UintArray = (numero) => Uint8Array
                .from(randomBytes(numero));

            message.messageContextInfo ||= {};
            const info = message.messageContextInfo;
            info.messageSecret ||= UintArray(32);
            info.deviceListMetadataVersion = 2;
            info.deviceListMetadata ||= {};

            info.deviceListMetadata.senderKeyHash ||= UintArray(32);
            info.deviceListMetadata.senderTimestamp ||= Date.now();
            info.deviceListMetadata.recipientKeyHash ||= UintArray(32);
            info.deviceListMetadata.recipientTimestamp ||= Date.now();
            info.threadId ||= [];

            return message;
        },
    }

    if ($process.env.data?.subBot) {
        connection.syncFullHistory = false;
        connection.fireInitQueries = false;
        connection.getMessage = async key => null;
    }

    if (conn.connectType == 'qr-code') {
        connection.browser = Browsers.macOS('Desktop')
    }

    const sock = await makeWASocket(connection);
    global.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    store?.bind(sock.ev)

    if (conn.connectType == 'pin-code') {
        let numero = conn.phoneNumber.replace(/\D/g, '')
        await new Promise(resolve => setTimeout(resolve, 3000));
        const pairingCode = await sock.requestPairingCode(numero);
        return {
            PairingCode: pairingCode,
            state, store, ...sock, proto
        }
    } else {
        return { ...sock, state, store, proto }
    }
}