// ./core/format.js

const format = {
    id: String,
    type: String,
    message: Object,
    body: String,
    command: String,
    args: Array(String),
    text: String,
    tag: Array(String),
    isCmd: Boolean,
    plugin: Object,

    bot: Object({
        id: String,
        name: String,
        number: String,
        fromMe: Boolean,
        roles: Object({
            admin: Boolean,
        }),
        getDesc: Function,
        getPhoto: Function,
        setPhoto: Function,
        setDesc: Function,
        setName: Function,
        join: Function,
        mute: Function,
        block: Function,
        role: Function,
    }),

    chat: Object({
        id: String,
        isGroup: Boolean,
        name: String,
        desc: String,
        size: Number,
        created: Number,
        owner: String,
        participants: Array(Object),
        admins: Array(String),
        db: Function,
        add: Function,
        remove: Function,
        promote: Function,
        demote: Function,
        getPhoto: Function,
        setPhoto: Function,
        setDesc: Function,
        setName: Function,
        getCodeInvite: Function,
        getLinkInvite: Function,
        revoke: Function,
        settings: Object({
            lock: Function,
            announce: Function,
        }),
        getDesc: Function,
    }),

    sender: Object({
        id: String,
        name: String,
        number: String,
        roles: Object({
            rowner: Boolean,
            owner: Boolean,
            modr: Boolean,
            prem: Boolean,
            admin: Boolean,
            bot: Boolean,
        }),
        mentioned: Array(String),
        getDesc: Function,
        getPhoto: Function,
        role: Function,
    }),

    content: Object({
        text: String,
        args: Array(String),
        media: Object({
            mimeType: String,
            fileName: String,
            download: Function,
        }),
    }),

    quoted: Object({
        id: String,
        type: String,
        sender: Object({
            id: String,
            name: String,
            number: String,
            roles: Object({
                rowner: Boolean,
                owner: Boolean,
                modr: Boolean,
                prem: Boolean,
                bot: Boolean,
            }),
            getDesc: Function,
            getPhoto: Function,
            role: Function,
        }),
        content: Object({
            text: String,
            args: Array(String),
            media: Object({
                mimeType: String,
                fileName: String,
                download: Function,
            }),
        }),
    }),

    reply: Function,
    react: Function,
    sms: Function,
};

export default format;