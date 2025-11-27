import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec);

const plugin = {
    case: ['>', '$'],
    usage: ['> <script>', '$ <shell>'],
    category: ['owner'],
    usePrefix: false,
    command: true
}

plugin.script = async (m, { sock }) => {
    if (!m.sender.role('rowner', 'owner')) return;

    try {
        if (m.body.startsWith('>')) {
            let evaled = await eval(`${m.body.slice(2)}`)
            if (typeof evaled !== 'string') evaled = util.inspect(evaled, { depth: 1 });
            if (evaled !== 'undefined') await m.reply(evaled);
        }
        else if (m.body.startsWith('$')) {
            let shellCommand = (m.body.trim()).slice(1).trim();
            let { stdout, stderr } = await execPromise(shellCommand);
            let response = stdout || stderr || 'No output';
            await m.reply(response.trim());
        }
    } catch (err) {
        await m.reply(String(err));
    }
}

export default plugin