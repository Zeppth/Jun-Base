// ./library/plugins.js

import path from "path";
import { pathToFileURL } from 'url';
import { watch } from 'chokidar';
import lodash from 'lodash'

/**
 * API Usage:
 * plugins.import('@funcion')
 * plugins.import({ file: 'utils/file.js' })
 * plugins.query({ role: 'admin' })
 * plugins.export('db', connection)
 */

export class Plugins {
    constructor(folderPath, defaultObjects = {}) {
        this.registry = new Map();
        this.shared = new Map();
        this.folder = folderPath;
        this.context = defaultObjects;
        this.watcher = null;
    }

    remove(key) {
        if (typeof key === 'string')
            return this.registry.delete(key);
        return null
    }

    import(query) {
        if (typeof query === 'object' && query?.file)
            return this.registry.get(query.file);
        if (typeof query === 'string')
            return this.shared.get(query) || null;
        return null;
    }

    export(key, value) {
        if (!this.shared.has(key))
            this.shared.set(key, value);
        else Object.assign(this
            .shared.get(key), value);
        return this.shared.get(key);
    }

    load() {
        return new Promise((resolve, reject) => {
            this.watcher = watch(this.folder, {
                persistent: true,
                ignoreInitial: false,
                depth: 99
            });

            this.watcher.on('add', (filePath) => {
                const relPath = path.relative(this.folder, filePath);
                console.log(global.PLUGINS_MSG.newPlugin, relPath);
                this.loadFile(relPath);
            })

            this.watcher.on('change', (filePath) => {
                const relPath = path.relative(this.folder, filePath);
                console.log(global.PLUGINS_MSG.updatedPlugin, relPath);
                this.remove(relPath);
                setTimeout(() => this.loadFile(relPath), 1000);
            })

            this.watcher.on('unlink', (filePath) => {
                const relPath = path.relative(this.folder, filePath);
                console.log(global.PLUGINS_MSG.deletedPlugin, relPath);
                this.remove(relPath);
            })

            this.watcher.on('error', (e) => {
                console.error("Watcher Error:", e);
                reject(e);
            }).on('ready', () => { resolve() });
        });
    }

    async loadFile(file) {
        if (typeof file !== 'string') return;

        const absPath = path.join(this.folder, file);
        const fileURL = (pathToFileURL(absPath)).href
        const versionedURL = `${fileURL}?update=${Date.now()}`;

        const _import = async (fun) => {
            try { return await fun(await import(versionedURL)) } catch (e) {
                if (e.code === 'ERR_UNSUPPORTED_DIR_IMPORT') return;
                console.error(`Plugin Registration Error (${file}):`, e);
            }
        }

        if (file.endsWith('.plugin.js')) return _import(async (mod) => {
            const module = mod.default || mod;
            if (typeof module.export === 'object') {
                Object.entries(module.export).forEach(([k, v]) => {
                    this.shared.set(k, v);
                });
            }

            this.registry.set(file, {
                ...this.context,
                fileName: file,
                ...module
            });

            return;
        })

        if (file.endsWith('.js')) return _import(async (mod) => {
            this.registry.set(file, mod);
        })

        this.registry.set(file, absPath);
    }

    async query(object) {
        if (typeof object === 'string') return this.registry.get(object);
        if (typeof object !== 'object' || object === null) return [];

        return Array.from(this.registry.entries()).filter(([filename, plugin]) => {
            if (!filename.endsWith('.plugin.js')) return false;
            return Object.entries(object).every(([key, expected]) => {
                if (!plugin || typeof plugin !== 'object') return false;
                const actual = plugin[key];
                if (typeof expected === 'string' && Array.isArray(actual))
                    return actual.includes(expected);
                if (Array.isArray(expected) && typeof actual === 'string')
                    return expected.includes(actual);
                if (Array.isArray(expected) && Array.isArray(actual))
                    return expected.some(v => actual.includes(v));
                return lodash.isEqual(expected, actual);
            });
        }).map(([_, plugin]) => plugin);
    }
};