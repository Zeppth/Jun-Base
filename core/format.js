// ./core/format.js

const format = {
    id: String,
    type: String,
    timestamp: String,
    chat: Object({}),
    bot: Object({}),
    sender: Object({}),
    content: Object({
        text: String,
        media: Object({
            mimeType: String,
            fileName: String,
            download: Function,
        }),
    }),
    quoted: Object({
        id: String,
        type: String,
        chat: Object({}),
        sender: Object({}),
        content: Object({
            text: String,
            media: Object({
                mimeType: String,
                fileName: String,
                download: Function,
            }),
        })
    }),
}