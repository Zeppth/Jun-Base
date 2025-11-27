// ./library/process.js

import { EventEmitter } from "events";
import crypto from "crypto";

const Process = { env: {} };
const requestId = new Map();
const event = new EventEmitter();
const keys = Object.keys(process.env);

const randomId = (number = 8) => crypto
    .randomBytes(number)
    .toString('hex')
    .toUpperCase();

for (const key of keys) {
    const env = process.env[key]
    try { Process.env[key] = JSON.parse(env) }
    catch { Process.env[key] = env }
}

process.on('message', (data) => {
    if (data.requestId && requestId.has(data.requestId)) {
        const request = requestId.get(data.requestId);
        clearTimeout(request.timeout);
        requestId.delete(data.requestId);
        return request.resolve(data);
    } else {
        return event.emit('message', {
            message: data
        })
    }
})

const funs = {
    assign: (value) => {
        if (!value || typeof value !== 'object')
            return console.log('value undefined')
        Object.assign(Process.env, value)
    },
    delete: (key) => delete Process.env[key],
}

const send = async (content, type = 'send') => {
    if (!content || typeof content !== 'object')
        return console.log('content undefined')
    if (typeof content.content !== 'object')
        return console.log('content undefined')
    content.sender ||= Process.env.dataConfig;

    if (type !== 'request') return process.send({
        sender: content.sender,
        content: content.content
    })

    else return new Promise((resolve, reject) => {
        let _requestId
        if (content.requestId)
            _requestId = content.requestId
        else _requestId = randomId()
        const timeout = setTimeout(() => {
            requestId.delete(_requestId);
            reject(new Error("Request Timeout"));
        }, 10000);

        requestId.set(_requestId, {
            reject, resolve,
            timeout: timeout
        });

        try {
            process.send({
                sender: content.sender,
                content: content.content,
                requestId: _requestId
            });
        } catch (e) {
            clearTimeout(timeout);
            requestId.delete(_requestId);
            reject(new Error(e));
        }
    })
}

Object.assign(Process, {
    ...funs,
    send: send,
    ev: event
})

export default Process
