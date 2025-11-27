const plugin = {
    before: true,
    index: 1,
    script: async (m, { sock, control, plugin }) => {
        const type = m.type?.replace(/message/i, '')
        const db = await global.db.open('chats')
        let chat = (db.data[m.chat.id] ||= {})
        let sender = (chat[m.sender.id] ||= {})
        sender[type] = (sender[type] || 0) + 1
        sender.total = (sender.total || 0) + 1
        await db.update()
    }
}

export default plugin