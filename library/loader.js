// ./library/handlerLoader.js

import path from "path";
import { pathToFileURL } from 'url';
import { watch } from 'chokidar';
import fs from 'fs/promises';

class handlerLoader {
    constructor(folderPath) {
        this.files = new Map();
        this.folder = path.resolve
            (folderPath);

        this.watcher = watch(folderPath, {
            ignoreInitial: true,
            persistent: true
        });

        this.watcher.on('add', (file) => {
            file = path.basename(file);
            setTimeout(() => this
                .loadFile(file), 1000);
        })

        this.watcher.on('unlink', (file) => {
            file = path.basename(file)
            if (this.files.has(file))
                this.files.delete(file)
        })

        this.watcher.on('change', (file) => {
            file = path.basename(file);
            if (this.files.has(file))
                this.files.delete(file)
            setTimeout(() => this
                .loadFile(file), 1000);
        })
    }

    async loadFiles() {
        const files = await fs
            .readdir(this.folder)
        for (const file of files) {
            await this.loadFile(file)
        }
    }

    async loadFile(fileName) {
        if (!fileName.endsWith('.js')) return;
        const filePath = `${this.folder}/${fileName}`
        const fileURL = pathToFileURL(filePath);
        try {
            const file = await import(`${fileURL
                .href}?update=${Date.now()}`)
            this.files.set(fileName, file);
        } catch (e) { console.error(e) }
    }

    get(fileName) {
        if (this.files.has(fileName))
            return this.files.get(fileName);
        return null;
    }
}

export default new handlerLoader('./core/handlers');