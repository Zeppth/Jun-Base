// ./library/sock.assign.js

import logger from './log.js';
import { TmpStore } from './utils.js';

import {
    generateWAMessageContent,
    generateWAMessageFromContent,
    downloadMediaMessage,
} from '@whiskeysockets/baileys';

import $base from './db.js';

export default async function (sock) {
    try {
        sock.Baileys = async () => {
            return (await import('@whiskeysockets/baileys')).default
        }

        sock.downloadMedia = async (message, type = 'buffer') => {
            if (typeof message !== 'object')
                return new Error('not a message object');
            if (!message || !message.key || !message.key.id)
                throw new Error('not a valid message object');
            return await downloadMediaMessage(message, type, {
                reuploadRequest: sock.updateMediaMessage
            })
        }

        sock.generateWMContent = (o) => {
            return generateWAMessageContent(o, {
                upload: sock.waUploadToServer
            })
        }

        sock.sendWAMContent = async (jid, message, options = {}) => {
            const gmessage = await generateWAMessageFromContent(jid, message, options)
            return sock.relayMessage(jid, gmessage.message, {})
        }

        sock.setReplyHandler = async (message, options = {}, expiresIn = 1000 * 60 * 15) => {
            if (!message?.key?.id)
                throw new Error('sock.setReplyHandler: message.key.id is required');

            if (!options.routes || !Array.isArray(options.routes))
                throw new Error('sock.setReplyHandler: options.routes must be an array');

            for (const r of options.routes) {
                if (!r.code || typeof r.code !== 'object')
                    throw new Error('sock.setReplyHandler: each route must contain code{}');
                if (!r.code.executor)
                    throw new Error('sock.setReplyHandler: code.executor is required');
            }

            options.lifecycle = options.lifecycle || {};
            options.security = options.security || {};
            options.state = options.state || {};

            if (expiresIn !== undefined) {
                if (typeof expiresIn !== 'number' || isNaN(expiresIn)) {
                    throw new Error('sock.setReplyHandler: expiresIn must be a number (ms)');
                }
                options.lifecycle.createdAt = Date.now();
                options.lifecycle.expiresAt = Date.now() + expiresIn;
            }

            for (const route of options.routes) {
                const code = route.code;

                if (typeof code.guard === 'function') {
                    code.guard = code.guard.toString();
                }
                if (typeof code.executor === 'function') {
                    code.executor = code.executor.toString();
                }
            }

            const db = await $base.open('@reply:Handler');
            Object.assign(db.data, { [message.key.id]: options });
            await db.update();
        };

        sock.loadMessage = async (jid, id) => {
            if (!global.config.saveHistory)
                return new Error('mainBotStore is not enabled')

            const chat = await global.db.open(
                '@history/' + jid
            )
            if (!chat.data) chat.data = {}
            const senderId = chat.data[id]
            if (!senderId) return null

            const sender = await global.db.open(
                '@history/' + jid + '/' + senderId
            )
            if (!Array.isArray(sender.data)) sender.data = []
            return sender.data.find(m => m.key.id === id)
        }

    } catch (e) { logger.error(e) }
    return sock
}