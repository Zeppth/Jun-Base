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
        media: (m.type == 'imageMessage' || m.type == 'videoMessage') ? {
            mimeType: message?.message?.[m.type]?.mimetype || '',
            fileName: message?.message?.[m.type]?.filename || '',
            download: async () => await sock.downloadMedia(message)
        } : false
    }

    // QUOTED
    let quotedMessage = false
    if (contextInfo.quotedMessage) {
        quotedMessage = {
            key: {
                remoteJid: contextInfo.remoteJid || message.key.remoteJid,
                fromMe: contextInfo.participant == sock.user.id.split(":")[0] + "@s.whatsapp.net",
                participant: contextInfo.participant,
                id: contextInfo.stanzaId
            },
            message: {
                ...contextInfo.quotedMessage
            }
        }

        m.quoted = { id: quotedMessage.key.id }
        m.quoted.type = (() => {
            for (const type of Object.keys(messageExtractors)) {
                if (quotedMessage.message[type]) return type;
            }
        })()

        const quoted_content_text = await (async () => {
            try { return messageExtractors[m.type](quotedMessage.message) || '' }
            catch (e) { return '' }
        })()

        m.quoted.content = {
            text: quoted_content_text,
            args: quoted_content_text?.trim().split(/ +/),
            media: (m.quoted.type == 'imageMessage' || m.quoted.type == 'videoMessage') ? {
                mimeType: quotedMessage?.message?.[m.type]?.mimetype || '',
                fileName: quotedMessage?.message?.[m.type]?.filename || '',
                download: async () => await sock.downloadMedia(quotedMessage)
            } : false
        }
    }


    return {
        contextInfo,
        messageExtractors,
        quotedMessage
    }
}