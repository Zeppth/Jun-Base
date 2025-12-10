export default {
    case: 'info',
    command: true,
    async script(m) {
        await m.reply([
            `*${global.config.name}*`,
            `Versión: ${global.$package.version}`,
            `Prefijos: ${global.config.prefixes}`,
            `Historial: ${global.config.saveHistory ? 'Sí' : 'No'}`
        ].join('\n'));
    }
}
