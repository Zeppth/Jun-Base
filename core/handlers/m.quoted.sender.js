// ./core/handlers/m.quoted.sender.js

const $db = global.db

export default async ({ m, cached }) => {
    const db = await $db.open('@users')
    const users = db.data

    const quotedMessage = m.quoted.message
    m.quoted.sender = {}

    if (m.chat.isGroup && !m.quoted.sender.id) {
        m.quoted.sender.id = quotedMessage.key.participant?.endsWith('@lid')
            ? quotedMessage.key.participant : quotedMessage.key.participantAlt;
    }

    else if (!m.chat.isGroup && !m.quoted.sender.id) {
        m.quoted.sender.id = quotedMessage.key.remoteJid.endsWith('@lid')
            ? quotedMessage.key.remoteJid : quotedMessage.key.remoteJidAlt;
    }

    m.quoted.sender.roles = {
        ...structuredClone(users[m.quoted.sender.id]?.roles || {})
    }

    m.quoted.sender.roles.bot = m.bot.id === m.quoted.sender.id;
    
    m.quoted.sender.role = async (...array) => array
        .some(role => m.quoted.sender.roles[role]);

    m.quoted.sender.name = quotedMessage.pushName
        ?? (users[m.quoted.sender.id]?.name)
        ?? (m.quoted.sender.id === m.bot.id ? m.bot.name : '')
        ?? (m.quoted.sender.id === m.sender.id ? m.sender.name : '')

    if (m.chat.isGroup) {
        m.quoted.sender.number = quotedMessage.key.participantAlt?.split('@')[0] || undefined;
    } else {
        m.quoted.sender.number = quotedMessage.key.remoteJid?.split('@')[0] || undefined;
    }

    m.quoted.sender.getDesc = async () =>
        await cached.sender.desc(m.quoted.sender.id);
    
    m.quoted.sender.getPhoto = async () =>
        await cached.sender.photo(m.quoted.sender.id, 'image')
}