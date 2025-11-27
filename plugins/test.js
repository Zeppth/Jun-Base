import fetch from 'node-fetch'

const flagToLang = {
    "🇲🇽": "es", "🇬🇹": "es", "🇸🇻": "es", "🇭🇳": "es", "🇳🇮": "es", "🇨🇷": "es", "🇵🇦": "es",
    "🇨🇴": "es", "🇻🇪": "es", "🇪🇨": "es", "🇵🇪": "es", "🇧🇴": "es", "🇨🇱": "es", "🇦🇷": "es",
    "🇺🇾": "es", "🇵🇾": "es", "🇧🇷": "pt", "🇺🇸": "en", "🇬🇧": "en",
    "🇯🇵": "ja", "🇨🇳": "zh-CN", "🇰🇷": "ko", "🇫🇷": "fr", "🇮🇹": "it", "🇩🇪": "de"
}

async function gTranslate(text, lang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const json = await res.json()
    return json[0]?.map(x => x[0]).join('') || ''
}


let handler = m => m
handler.before = async function (m, { conn }) {
    try {
        const rx = m.message?.reactionMessage
        if (!rx) return

        const emoji = rx.text
        const lang = flagToLang[emoji]
        if (!lang) return

        console.log("Traducción solicitada a:", lang)

        const jid = rx.key.remoteJid
        const id = rx.key.id

        let orig = conn.chats[jid].messages[id]

        console.log("Mensaje original cargado:", orig)

        if (!orig?.message) return

        const text =
            orig.message?.extendedTextMessage?.text ||
            orig.message?.conversation ||
            orig.message?.imageMessage?.caption ||
            orig.message?.videoMessage?.caption ||
            ""

        if (!text) return

        const translated = await gTranslate(text, lang)

        await conn.sendMessage(jid, {
            text: `🌐 *Traducción (${emoji})*\n\n${translated}`
        }, { quoted: orig })

    } catch (e) {
        console.error("ERROR EN _translate-flag.js:", e)
    }
}

export default handler


/*await sock.setReplyHandler(message, {
    security: {
        userId: "", // "all", "ID"
        chatId: "", // "all", "chatID"
        scope: "" // "private", "group", "all"
    },
    lifecycle: {
        createdAt: 1716300000000,
        expiresAt: 1716300300000,
        consumeOnce: true
    },
    routes: [{
        priority: 1,
        code: {
            guard: "", // funcion
            executor: "" // funcion
        }
    }, {
        priority: 2,
        code: {
            guard: "", // funcion
            executor: "" // funcion
        }
    }],
    state: {
        variable: "",
    }
})*/