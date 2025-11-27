const plugin = {
    before: true,
    index: 3,
    script: async (m, { sock, control, plugin }) => {
        if (m.isCmd) return;
        if (!m.sender.mentioned?.includes(m.bot.id)) return;
        const mentionBot = '@' + m.bot.id.split('@')[0]
        m.text = m.text.split(mentionBot).join('')
        const asistente = plugin.import('@asistente')
        await asistente({ m, sock, plugin })
        control.end = true
        return
    }
}

export default plugin