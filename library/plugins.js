// ./library/plugins.js

import path from "path";
import logger from "./log.js"
import { pathToFileURL } from 'url';
import { watch } from 'chokidar';
import fs from 'fs/promises';
import lodash from 'lodash'

export class Plugins {
    constructor(folderPath, defaultObjects = {}) {
        this['@export'] = new Map();
        this['@plugins'] = new Map();
        this['@folderPath'] = path.resolve(folderPath);
        this['@Objects'] = defaultObjects

        watch(this['@folderPath'], {
            persistent: true,
            ignoreInitial: true,
            depth: 99
        }).on('add', (filePath) => {
            const file_path = path.relative
                (this['@folderPath'], filePath);
            this.set(file_path);
        }).on('change', (filePath) => {
            const file_path = path.relative
                (this['@folderPath'], filePath);
            if (this['@plugins'].has(file_path))
                this['@plugins'].delete(file_path)
            setTimeout(() => this.set(file_path), 1000);
        }).on('unlink', (filePath) => {
            const file_path = path.relative
                (this['@folderPath'], filePath);
            if (this['@plugins'].has(file_path))
                this['@plugins'].delete(file_path);
        }).on('error', e => logger.error(e));
    }

    has(any) { return this['@plugins'].has(any) }
    delete(any) { return this['@plugins'].delete(any) }
    import(any) { return this['@export'].get(any) }

    export(any, object) {
        if (!this['@export'].has(any)) {
            this['@export'].set(any, object)
        } else {
            const existing = this['@export'].get(any);
            Object.assign(existing, object)
        }
        return this['@export'].get(any);
    }

    async load() {
        try {
            const files = await fs.readdir
                (this['@folderPath'], { recursive: true });
            for (const file of files) { await this.set(file) }
        } catch (e) {
            logger.error("Error cargando plugins:", e);
        }
    }

    async set(any) {
        if (!any.endsWith('.plugin.js')) return;
        const filePath = path.join(this['@folderPath'], any);
        const fileURL = pathToFileURL(filePath);

        try {
            const mod = await import(`${fileURL.href}?update=${Date.now()}`);
            const module = mod.default || mod;
            if (typeof module.export === 'object') {
                Object.entries(module.export).forEach(([key, value]) => {
                    this["@export"].set(key, value);
                });
            }

            this['@plugins'].set(any, {
                ...this['@Objects'],
                fileName: any,
                ...module
            });

        } catch (e) {
            if (e.code === 'ERR_UNSUPPORTED_DIR_IMPORT') return;
            logger.error(`Error al cargar plugin ${any}:`, e);
        }
    }

    async get(any) {
        if (typeof any === 'string') return this['@plugins'].get(any);
        if (typeof any !== 'object' || any === null) return [];

        return Array.from(this['@plugins'].values()).filter(plugin =>
            Object.entries(any).every(([key, value]) => {
                if (typeof value === 'string' && Array.isArray(plugin[key]))
                    return plugin[key].includes(value);
                if (Array.isArray(value) && typeof plugin[key] === 'string')
                    return value.includes(plugin[key]);
                if (Array.isArray(value) && Array.isArray(plugin[key]))
                    return value.some(v => plugin[key].includes(v));
                return lodash.isEqual(value, plugin[key]);
            })
        );
    }
};