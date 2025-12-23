// ./core/config.js

import path from 'path';
import fs from 'fs/promises';
import { JunDB } from '../library/db.js';

const { proto } = (await import('@whiskeysockets/baileys/WAProto/index.js')).default;

global.$package = await fs.readFile(path.resolve('package.json'))
    .then(data => JSON.parse(data))

global.$dir_main = {
    plugins: path.resolve('./plugins'),
    creds: path.resolve('./storage/creds'),
    store: path.resolve('./storage/store'),
    temp: path.resolve('./storage/temp'),
}

global.db = new JunDB();
global.$proto = proto;
global.$dir_bot = {}

await global.db.init({
    folder: global
        .$dir_main.store,
    memoryLimit: 15,
    memoryTTL: 30
})