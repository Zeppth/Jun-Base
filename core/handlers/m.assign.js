// ./core/handlers/m.assign.js

import logger from '../../library/log.js';

export default async function ({ m, sock, message }) {
    try {
        m.reply = async (text) => {
            if (typeof text == 'string') {
                const mentionedJid = (text.match(/@(\d{0,16})/g) || []).map(v => v.slice(1) + '@lid');
                return await sock.sendMessage(m.chat.id, { text: text, contextInfo: { mentionedJid } }, { quoted: message });
            } else if (typeof text == 'object') return await sock.sendMessage(m.chat.id, text, { quoted: message });
            else return new Error('[E]: m.reply(string ?)')
        }

        m.react = async (text) => {
            if (!text) return;
            if (typeof text !== 'string') return;
            const react = global.REACT_EMOJIS[text];
            return sock.sendMessage(m.chat.id, {
                react: {
                    text: react ?? text,
                    key: message.key
                }
            });
        }

        m.sms = (type) => {
            let msg = global.MSG[type]
            if (!msg) return;
            return m.reply(msg)
        }

    } catch (e) { logger.error(e) }
}