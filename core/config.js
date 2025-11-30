// ./core/config.js

import path from 'path';
import fs from 'fs/promises';
import base from '../library/db.js';

const { proto } = (await import('@whiskeysockets/baileys/WAProto/index.js')).default;

global.$package = await fs.readFile(path.resolve('package.json'))
    .then(data => JSON.parse(data))

global.$dir_main = {
    creds: path.resolve('./storage/creds'),
    store: path.resolve('./storage/store'),
    temp: path.resolve('./storage/temp'),
}

global.db = base;
global.$proto = proto;

global.$dir_bot = {}