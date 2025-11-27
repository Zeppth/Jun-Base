// ./core/handlers/m.chat.group.js

export default async ({ m, cached }) => {
    m.chat.metaData = await cached.group.metaData(m.chat.id);
    m.chat.size = m.chat.metaData.size || 0
    m.chat.desc = m.chat.metaData.desc || ''
    m.chat.name = m.chat.metaData.subject || ''
    m.chat.created = m.chat.metaData.creation || 0
    m.chat.participants = m.chat.metaData.participants || []
    m.chat.owner = m.chat.metaData.owner || m.chat.metaData
        .subjectOwner || 'undefined'
    m.chat.admins = m.chat.participants.filter(o => ['admin', 'superadmin']
        .some(_ => _ === o.admin)).map(v => v.jid ?? v.id) || []

    m.sender.roles.admin = m.chat.admins.includes(m.sender.id) || false
    m.bot.roles.admin = m.chat.admins.includes(m.bot.id) || false
}