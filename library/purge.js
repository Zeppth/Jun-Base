// ./library/temp.js
import path from 'path'
import fs from 'fs/promises'

const _path = global.$dir_main

setInterval(async () => {
    try {
        const files = await fs.readdir(_path.temp)
        if (files.length < 1) return false

        const unlink = async (file) => {
            try { await fs.unlink(path.join(_path.temp, file)) }
            catch (e) { console.error(e) }
        }

        for (const file of files) {
            unlink(file)
        }
    } catch (e) { console.error(e) }
}, 1000 * 60)
