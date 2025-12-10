// ./core/handlers/m.parser.js

export default async ({ m, sock }) => {
    m.body = m.body ?? m.content.text;

    m.tag = m.body ?
        (m.body.match(/tag=[^ ]+/g) || [])
            .map(tag => tag.split('=')[1]) : [];

    m.body = m.tag.length > 0
        ? m.body.replace(/tag=[^\s]+/g, '')
            .replace(/\s+/g, ' ').trim() : m.body || '';

    m.args = m.body.trim().split(/ +/).slice(1)
    m.text = m.args.length > 0 ? m.args.join(" ") : m.body;

    const Prefix = global.config.prefixes;

    // usePrefix = true
    if (Prefix && Prefix.includes(m.body[0])) {

        m.command = m.body.substring(1).trim()
            .split(/ +/)[0].toLowerCase()

        const plugin = await sock.plugins.query({
            case: m.command,
            usePrefix: true,
            command: true,
        })

        m.isCmd = plugin[0] ? true : false;
        m.plugin = plugin[0] ?? null;

    }

    // usePrefix = false
    else if (Prefix && !Prefix.includes(m.body[0])) {

        m.command = m.body.trim()
            .split(/ +/)[0].toLowerCase()

        const plugin = await sock.plugins.query({
            case: m.command,
            usePrefix: false,
            command: true,
        })

        m.isCmd = plugin[0] ? true : false;
        m.plugin = plugin[0] ?? null;
    }

    // Prefix = undefined
    else if (!Prefix) {
        m.command = m.body.trim()
            .split(/ +/)[0].toLowerCase()

        const plugin = await sock.plugins.query({
            case: m.command,
            command: true
        })

        m.isCmd = plugin[0] ? true : false;
        m.plugin = plugin[0] ?? null;
    }
}
