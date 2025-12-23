// ./core/main.js

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
chalk.level = 2

await import('../config.js')
await import('./config.js')

/*INDEX*/ {
    const folder = path.resolve(`./storage/`)

    fs.mkdirSync(folder, { recursive: true });
    for (const _folder of ['creds', 'store', 'temp']) {
        fs.mkdirSync(path.join(folder, _folder),
            { recursive: true });
    }

    for (const key of Object.keys(process.env)) {
        const env = process.env[key]
        try { process.env[key] = JSON.parse(env) }
        catch { process.env[key] = env }
    }

    process.on('uncaughtException', (err) => {
        console.error(chalk.bgRedBright('[ERROR]'), err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error(chalk.bgRedBright('[REJECTION]'),
            promise, 'reason:', reason);
    });
}

// library
import { MakeClient } from '../library/client.js';
import { Plugins } from '../library/plugins.js';
import handlerLoader from '../library/loader.js';
import { SubBots } from '../library/bots.js';

// tmp
await import('../library/purge.js')
const _path = global.$dir_main

await handlerLoader.loadFiles();

const plugins = new Plugins(_path.plugins, {
    subBots: false,
    usePrefix: true,
    stubtype: false,
    command: false,
});

const subBots = new SubBots(
    './storage/subBots', plugins);

await plugins.load()

// start
async function StartBot() {
    const mainBot = new MakeClient();

    mainBot.events.on('connection', async (update) => {
        process.send(update)
    });

    const sock = await mainBot.start({
        folderPath: _path.creds,
        ...process.env.connOptions
    });

    mainBot.events.on('messages', async (m) => {
        if (!mainBot.sock.plugins) mainBot.sock.plugins = plugins;
        if (!mainBot.sock.subBots) mainBot.sock.subBots = subBots;

        mainBot.sock.subBot = false;

        try {
            const chatUpdate = handlerLoader
                .get('core.handler.js')
            await chatUpdate.default(m, sock)
        } catch (e) {
            console.error(e);
        }
    })

    sock.ev.on('call', async (call) => {
        const callInfo = call[0]
        if (callInfo.status === 'offer') await sock
            .rejectCall(callInfo.id, callInfo.from)
    })
}

await StartBot()
