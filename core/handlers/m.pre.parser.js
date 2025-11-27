// ./core/handlers/m.pre.parser.js

import lodash from 'lodash';
import $base from '../../library/db.js';

export default async ({ m, sock }) => {
    const db = await $base.open('@reply:Handler')

    if (!db.data[m.quoted.id]) return;
    const replyHandler = lodash.cloneDeep(db.data[m.quoted.id])

    const security = replyHandler.security || {}
    const lifecycle = replyHandler.lifecycle || {}
    const routes = replyHandler.routes || []
    const state = replyHandler.state || {}

    if (routes.length === 0) return;
    if (security.userId && !(
        security.userId === 'all' ||
        security.userId === m.sender.id
    )) return;

    if (security.chatId && !(
        security.chatId === 'all' ||
        security.chatId === m.chat.id)) return;

    if (security.scope && !(
        (security.scope === 'all') ||
        (security.scope === 'private' && !m.isGroup) ||
        (security.scope === 'group' && m.isGroup)
    )) return;

    if (lifecycle.createdAt && lifecycle.createdAt > Date.now()) return;

    const isExpired = lifecycle.expiresAt
        && lifecycle.expiresAt < Date.now();
    if (isExpired) {
        await m.reply('El tiempo límite para responder a este mensaje ha finalizado.');
        delete db.data[m.quoted.id];
        await db.update();
        return;
    }

    const routesSorted = [...routes].sort((a, b) =>
        a.priority - b.priority);

    for (const route of routesSorted) {
        const guard = route.code.guard
            ? eval(route.code.guard) : null;
        const executor = route.code.executor
            ? eval(route.code.executor) : null;

        if (typeof guard == 'function') {
            if (!!(await guard(m, {
                state, lifecycle,
                security, route, sock
            }))) continue;
        }

        if (lifecycle.consumeOnce) {
            delete db.data[m.quoted.id];
            await db.update();
        }

        if (typeof executor == 'function') {
            return await executor(m, {
                state, lifecycle,
                security, route, sock
            });
        }
    }
}