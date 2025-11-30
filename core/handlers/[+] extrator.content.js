const object = {
    'conversation': (message) => {
        return message.message.conversation || ''
    },
    'imageMessage': (message) => {
        return message.message.imageMessage.caption || ''
    },
    'videoMessage': (message) => {
        return message.message.videoMessage.caption || ''
    },
    'extendedTextMessage': (message) => {
        return message.message.extendedTextMessage.text || ''
    },
    'buttonsResponseMessage': (message) => {
        return message.message.buttonsResponseMessage.selectedButtonId || ''
    },
    'templateButtonReplyMessage': (message) => {
        return message.message.templateButtonReplyMessage.selectedId || ''
    },
    'interactiveResponseMessage': (message) => {
        return message.message.interactiveResponseMessage ? (JSON.parse(message
            .interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)).id || '' : ''
    },
}

export default object