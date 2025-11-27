const plugin = { export: {} }

plugin.export['@asistente/tools'] = {}

// group_toggleAnnouncements
plugin.export['@asistente/tools'].group_toggleAnnouncements = {
    tool: {
        name: "group_toggleAnnouncements", description: "Restringe o libera el envío de mensajes en el grupo. Cuando está bloqueado, solo los administradores pueden escribir.", parameters: { type: "OBJECT", properties: { announceOnly: { type: "BOOLEAN", description: "true para activar modo anuncios, false para restaurar el chat normal." } }, required: ["announceOnly"] }
    },
    script: async ({ m, sock, args, object }) => {
        if (!m.bot.roles.admin) return m.sms('botAdmin')
        if (!m.sender.role('admin', 'owner')) return m.sms('admin')
        await m.chat.settings.announce(args.announceOnly);
    }
}

// download_video
plugin.export['@asistente/tools'].download_video = {
    tool: {
        name: "download_video",
        description: "Herramienta especializada para descargar videos exclusivamente de las siguientes plataformas: Instagram, TikTok, Twitter, Facebook y YouTube. Úsala ÚNICAMENTE cuando el usuario pida bajar un video y proporcione un enlace que pertenezca a uno de estos sitios. Si la URL es de cualquier otro sitio, niégate amablemente explicando tus limitaciones.",
        parameters: { type: "OBJECT", properties: { url: { type: "STRING", description: "La URL del video a descargar. Debe ser un enlace válido de Instagram, TikTok, Twitter, Facebook o YouTube." } }, required: ["url"] }
    },
    script: async ({ m, sock, args, object, plugin }) => {
        const fun = plugin.import('@dl');
        let data;

        try {
            data = (await fun.alldown(args.url))?.data;

            if (!data) {
                if (args.url.match(/tiktok/i)) data = (await fun.tikdown(args.url))?.data;
                else if (args.url.match(/instagram/i)) data = (await fun.instagram(args.url))?.data;
                else if (args.url.match(/facebook|fb\.watch/i)) data = (await fun.fbdown2(args.url))?.data;
                else if (args.url.match(/youtu/i)) data = (await fun.ytdown(args.url))?.data;
                else if (args.url.match(/twitter|x\.com/i)) data = (await fun.twitterdown(args.url))?.data;
            }

            if (!data) {
                return {
                    status: "error",
                    message: "No se encontró video. La URL puede ser inválida, privada o el servicio está caído."
                };
            }

            await m.react('wait');

            object.push({
                document: { url: data.low || data.high },
                mimetype: 'video/mp4',
                fileName: (data.title || 'video') + '.mp4',
                caption: ``
            });

            await m.react('done');
            return {
                status: "success",
                title: data.title || "Video",
                details: "El archivo se ha enviado al chat correctamente."
            };

        } catch (e) {
            console.error(e);
            return {
                status: "error",
                message: "Error interno del servidor: " + e.message
            };
        }
    }
}


plugin.export['@asistente/tools'].tools = function () {
    const source = plugin.export['@asistente/tools'];
    return Object.keys(source).filter(key => key !== 'tools'
        && typeof source[key] === 'object').map(key =>
            source[key].tool);
}


export default plugin;