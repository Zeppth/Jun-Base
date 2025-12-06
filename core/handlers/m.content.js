// ./core/handlers/m.content.js
import handlerLoader from '../../library/loader.js';

export default async ({ m, sock, message }) => {
    const extrator = handlerLoader.get('[+] extrator.content.js');
    const messageExtractors = extrator.default

    /// MESSAGE

    m.type = (() => {
        for (const type of Object.keys(messageExtractors)) {
            try {
                if (message?.message?.[type]) { return type; }
                else { continue; }
            } catch (e) { continue }
        }
    })()

    const contextInfo = message?.message?.[m
        .type]?.contextInfo || {}


    const m_content_text = await (async () => {
        try { return messageExtractors[m.type](message) || ''; }
        catch (e) { return '' }
    })();

    m.content = {
        text: m_content_text,
        args: m_content_text?.trim().split(/ +/),
        media: (
            m.type == 'imageMessage'
            || m.type == 'videoMessage'
        ) ? {
            mimeType: message?.message?.[m.type]?.mimetype || '',
            fileName: message?.message?.[m.type]?.filename || '',
            download: async () => await sock.downloadMedia(message)
        } : false
    }

    // QUOTED

    if (contextInfo.quotedMessage) {
        if (global.config.saveHistory) {
            m.quoted.message = await sock.loadMessage(
                message.key.remoteJid, contextInfo.stanzaId)
        } else {
            m.quoted.message = {}
            m.quoted.message.key = {
                remoteJid: contextInfo.remoteJid || message.key.remoteJid,
                fromMe: contextInfo.participant == sock.user.id.split(":")[0] + "@s.whatsapp.net",
                participant: contextInfo.participant,
                id: contextInfo.stanzaId
            }
            m.quoted.message.message = {
                ...contextInfo.quotedMessage
            }
        }


        const quoted = m.quoted.message
        m.quoted = { id: quoted.key.id }

        m.quoted.type = (() => {
            for (const type of Object.keys({
                'imageMessage': 'image',
                'videoMessage': 'video',
                'stickerMessage': 'sticker',
                'documentMessage': 'document',
                'audioMessage': 'audio',
                ...messageExtractors
            })) {
                if (quoted.message[type])
                    return type;
            }
        })()

        m.quoted.type ||= Object.keys(quoted.message)[0]
        
        const quoted_content_text = await (async () => {
            try {
                const fun = messageExtractors[m.quoted.type]
                if (fun) return fun(quoted?.message) || ''
                else return ''
            } catch (e) { return '' }
        })()

        m.quoted.content = {
            text: quoted_content_text || '',
            args: quoted_content_text?.trim().split(/ +/),
            media: (
                quoted.message?.imageMessage
                || quoted.message?.videoMessage
                || quoted.message?.stickerMessage
                || quoted.message?.documentMessage
                || quoted.message?.audioMessage
            ) ? {
                mimeType: quoted.message?.[m.quoted.type]?.mimetype || '',
                fileName: quoted.message?.[m.quoted.type]?.filename || '',
                download: async () => await sock.downloadMedia(m.quoted.message)
            } : false
        }
    }


    return {
        contextInfo,
        messageExtractors
    }
}