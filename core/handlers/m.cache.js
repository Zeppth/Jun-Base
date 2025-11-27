// ./core/handlers/m.cache.js

import { TmpStore } from '../../library/utils.js'

const store = new TmpStore(1000 * 60);

const memoAsync = async (string, fun) => {
    if (store.has(string))
        return store.get(string);
    const result = await fun()
    store.set(string, result);
    return result;
}

export default ({ sock }) => {
    const cached = {}
    cached.group = {
        photo: async (id, type) => {
            return await memoAsync(`${id}-${type}-photo`, async () =>
                await sock.profilePictureUrl(id, type).catch(_ =>
                    'https://files.catbox.moe/obz4b4.jpg'));
        },
        metaData: async (id) => {
            if (!id) return {};
            if (id.endsWith('@s.whatsapp.net')) return {}
            return await memoAsync(`${id}-metaData`, async () =>
                await sock.groupMetadata(id).catch(e => ({})))
        },
        inviteCode: async (id) => {
            return memoAsync(`${id}-inviteCode`, async () =>
                await sock.groupInviteCode(id))
        },
        inviteLink: async (id) => {
            return await memoAsync(`${id}-inviteLink`, async () =>
                `https://chat.whatsapp.com/${await cached
                    .group.inviteCode(id)}`);
        }
    }
    cached.sender = {
        photo: async (id, type) => {
            return await memoAsync(`${id}-${type}-photo`, async () =>
                await sock.profilePictureUrl(id, type).catch(_ =>
                    'https://files.catbox.moe/obz4b4.jpg'));
        },
        desc: async (id) => {
            return await memoAsync(`${id}-desc`, async () =>
                (await sock.fetchStatus(id) || {})
                    .status || 'undefined')
        }
    }

    return cached
}