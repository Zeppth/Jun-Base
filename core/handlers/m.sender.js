// ./core/handlers/m.sender.js

import $base from '../../library/db.js';
const userRoles = global.config.userRoles

export default async ({ m, cached, message, contextInfo }) => {
    m.sender = m.sender || {}
    m.sender.roles = {}
    m.sender.id = m.bot.fromMe ? m.bot.id : undefined;

    if (m.chat.isGroup && !m.sender.id) {
        m.sender.id = message.key.participant?.endsWith('@lid')
            ? message.key.participant : message.key.participantAlt;
    }

    else if (!m.chat.isGroup && !m.sender.id) {
        m.sender.id = message.key.remoteJid.endsWith('@lid')
            ? message.key.remoteJid : message.key.remoteJidAlt;
    }

    m.sender.name = m.bot.fromMe ? m.bot.name : message.pushName || '';
    m.sender.number = (m.sender.id)?.split('@')[0] || undefined;
    m.sender.user = '@' + m.sender.id?.split('@')[0] || undefined;
    m.sender.roles.bot = m.bot.id === m.sender.id;

    m.sender.getDesc = async () => await cached.sender.desc(m.sender.id);
    m.sender.getPhoto = async () => await cached.sender.photo(m.sender.id, 'image')
    m.sender.role = async (...array) => array.some(role => m.sender.roles[role]);
    m.sender.mentioned = contextInfo.mentionedJid ?? [];
    m.sender.db = async () => {
        const data = await $base.open('@users')
        return {
            _data: data,
            data: data.data[m.sender.id],
            update: async () => {
                await data.update()
            }
        }
    }

    // store
    const db = await $base.open('@users')
    const roles = userRoles[m.sender.number]
    const users = db.data

    const rol = {
        root: m.sender.roles.bot ? true : roles?.root || false,
        owner: m.sender.roles.bot ? true : roles?.owner || false,
        mod: m.sender.roles.bot ? true : roles?.mod || false,
        vip: m.sender.roles.bot ? true : roles?.vip || false,
    }

    if (!users[m.sender.id]) {
        users[m.sender.id] = {
            name: m.sender.name,
            banned: false,
            roles: rol
        }
    }

    if (roles) users[m.sender.id].roles = {
        ...users[m.sender.id].roles,
        ...roles
    }

    Object.assign(m.sender.roles,
        structuredClone({
            ...users[m.sender.id].roles
        }))

    await db.update()


    // chat user stats
    try {
        if (m.chat.isGroup) {
            const chat = await m.chat.db()
            chat.data.users[m.sender.id] ||= { messages: 0 }
            chat.data.users[m.sender.id].messages += 1
            const type = Object.keys(message.message || {})[0]
            chat.data.users[m.sender.id][type] ||= 0
            chat.data.users[m.sender.id][type] += 1
            await chat.update()
        }
    } catch (e) {
        console.error(e)
    }


    try {
        if (
            m.message?.message
            && global.config.saveHistory
            && m.chat.isGroup) {

            const chat = await global.db.open(
                '@history/' + m.chat.id)
            if (!chat.data) chat.data = {}
            chat.data[m.id] = m.sender.id

            const sender = await global.db.open(
                '@history/' + m.chat.id + '/' + m.sender.id)

            if (!Array.isArray(sender.data)) sender.data = []
            sender.data.push(m.message)

            if (sender.data.length > 50) {
                const objeto = sender.data.shift()
                if (objeto?.key?.id) delete chat
                    .data[objeto.key.id]
            }

            await chat.update()
            await sender.update()
        }
    } catch (e) {
        console.error(e)
    }

}