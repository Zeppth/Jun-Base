const plugin = {
    case: ['jun'],
    usage: ['.jun <tu solicitud>'],
    category: ['servicio'],
    command: true,
};

plugin.script = async (m, { sock, plugin }) => {
    const mentionBot = '@' + m.bot.id.split('@')[0]
    m.text = m.text.split(mentionBot).join('')
    const asistente = plugin.import('@asistente')
    return await asistente({ m, sock, plugin })
};

export default plugin;