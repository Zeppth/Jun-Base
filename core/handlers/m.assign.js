// ./core/handlers/m.assign.js

import logger from '../../library/log.js';

export default async function ({ m, sock, message }) {
    try {
        m.db = async (id) => {
            if (id.endsWith('@g.us')) {
                const db = await global.db
                    .open('@chat:' + id)
                return {
                    data: db.data,
                    _data: db.data,
                    update: async () => {
                        await db.update()
                    }
                }
            } else if (id.endsWith('@lid')) {
                const db = await global.db
                    .open('@users')
                db.data[id] ||= {
                    name: '',
                    banned: false,
                    roles: {}
                }
                return {
                    _data: db.data,
                    data: db.data[id],
                    update: async () => {
                        await db.update()
                    }
                }
            }
        }

        m.reply = async (text) => {
            if (typeof text == 'string') {
                const mentionedJid = (text.match(/@(\d{0,16})/g) || []).map(v => v.slice(1) + '@lid');
                return await sock.sendMessage(m.chat.id, { text: text, contextInfo: { mentionedJid } }, { quoted: message });
            } else if (typeof text == 'object') return await sock.sendMessage(m.chat.id, text, { quoted: message });
            else return new Error('[E]: m.reply(string ?)')
        }

        m.setBan = async (id, state = true) => {
            if (!id) return;
            if (!id.endsWith('@g.us') &&
                !id.endsWith('@lid')) return;
            const db = await m.db(id)
            db.data.banned = state
            await db.update()
        }


        m.setRole = async (id, state, ...roles) => {
            if (!id || !roles.length) return;
            if (!id.endsWith('@lid')) return;
            const db = await m.db(id);
            db.data.roles ||= {};
            for (const role of roles) {
                db.data.roles[role] = state;
            }
            await db.update();
            return true;
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