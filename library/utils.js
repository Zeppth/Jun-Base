// ./library/utils.js

export class SimpleTimer {
    constructor(fun, duration, type = 'timeout') {
        if (typeof fun !== 'function') throw new Error('ERR_INVALID_CALLBACK');
        if (typeof duration !== 'number' || duration <= 0) throw new Error('ERR_INVALID_DURATION');
        if (!['timeout', 'interval'].includes(type)) throw new Error('ERR_INVALID_TYPE');
        this.duration = duration;
        this.timer = null;
        this.type = type;
        this.fun = fun;
    }

    start() {
        this.stop();
        if (this.type === 'timeout') {
            this.timer = setTimeout(async () => {
                try { await this.fun() }
                catch (e) { console.error(`ERR_CALLBACK_EXECUTION:`, e) }
                finally { this.timer = null }
            }, this.duration);
        } else if (this.type === 'interval') {
            this.timer = setInterval(async () => {
                try { await this.fun() }
                catch (e) { console.error(`ERR_CALLBACK_EXECUTION:`, e) }
            }, this.duration);
        }
    }

    stop() {
        if (this.timer !== null) {
            if (this.type === 'timeout') clearTimeout(this.timer);
            else if (this.type === 'interval') clearInterval(this.timer);
            this.timer = null;
        }
    }

    get status() {
        return this.timer !== null;
    }
}

export class TmpStore {
    constructor(Time = 1000 * 60) {
        this.objects = new Map();
        this.Timeout = new Map();
        this.Time = Time;

        this.clearTime = (key) => {
            const timeout = this.Timeout.get(key);
            if (timeout) clearTimeout(timeout.time);
        };
    }

    async set(key, value) {
        if (this.Timeout.has(key))
            this.clearTime(key);
        this.objects.set(key, value);
        this.Timeout.set(key, {
            time: setTimeout(() =>
                this.delete(key),
                this.Time),
        });

        return value;
    }

    get(key) { return this.objects.get(key) }
    has(key) { return this.objects.has(key) }
    keys() { return Array.from(this.objects.keys()) }
    values() { return Array.from(this.objects.values()) }

    delete(key) {
        if (this.objects.has(key)) {
            this.clearTime(key);
            this.objects.delete(key);
            this.Timeout.delete(key);
            return true;
        }
        return false;
    }

    clear() {
        for (const key of this.Timeout.keys()) {
            this.clearTime(key);
        }
        this.objects.clear();
        this.Timeout.clear();
    }
}

export const color = {
    rgb: (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,
    bg: { rgb: (r, g, b) => `\x1b[48;2;${r};${g};${b}m` },
    reset: '\x1b[0m'
}