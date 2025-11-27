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
            const sendReaction = async (text) =>
                await sock.sendMessage(m.chat.id, { react: { text, key: message.key } });
            if (text === 'error' || text === 'done' || text === 'wait') {
                const reactions = { 'done': '✔️', 'wait': '⌛', 'error': '✖️' }[text];
                return await sendReaction(reactions);
            } else { return await sendReaction(text) }
        }

        m.sms = (type) => {
            let msg = {
                rowner: 'Este comando solo puede ser utilizado por el *dueño*',
                owner: 'Este comando solo puede ser utilizado por un *propietario*',
                modr: 'Este comando solo puede ser utilizado por un *moderador*',
                premium: 'Esta solicitud es solo para usuarios *premium*',
                group: 'Este comando solo se puede usar en *grupos*',
                private: 'Este comando solo se puede usar por *chat privado*',
                admin: 'Este comando solo puede ser usado por los *administradores del grupo*',
                botAdmin: 'El bot necesita *ser administrador* para usar este comando',
                unreg: 'Regístrese para usar esta función escribiendo:\n\n.registrar nombre.edad',
                restrict: 'Esta función está desactivada'
            }[type]
            if (msg) return m.reply(msg)
        }

    } catch (e) { logger.error(e) }
}