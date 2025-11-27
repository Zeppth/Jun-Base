// folder: plugins/servicio/@asistente.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const plugin = { export: {} }

plugin.export['@asistente'] = async ({ m, sock, plugin }) => {
    if (!m.text && !m.content.media) {
        return m.reply("Hola, soy tu asistente. Dime qué necesitas. Por ejemplo: `.asistente cambia el nombre del grupo a 'Nuevo Nombre'`");
    }

    await sock.sendPresenceUpdate('composing', m.chat.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sock.sendPresenceUpdate('paused', m.chat.id);

    const prompt = plugin.import('@asistente/prompt')
    const tc = plugin.import('@asistente/tools')

    try {
        const db = await global.db.open('@asistente');
        if (!db.data[m.sender.id]) db.data[m.sender.id] = [];

        const genAI = new GoogleGenerativeAI(global.googleApiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: { functionDeclarations: await tc.tools() },
            systemInstruction: prompt,
        });

        if (db.data[m.sender.id].length > 14) {
            let history = db.data[m.sender.id];
            let numero = history.length - 14;
            history.splice(0, numero);
        }

        const getTargetUsers = () => {
            let targets = [];
            const botId = m.bot.id;
            if (m.quoted?.sender?.id && m.quoted.sender.id !== botId) {
                targets.push({ id: m.quoted.sender.id, name: m.quoted.sender.name, source: 'Respondiendo a (citado)' });
            }
            if (m.sender.mentioned?.length > 0) {
                const mentionedIds = m.sender.mentioned.filter(id => id !== botId);
                mentionedIds.forEach(id => {
                    if (!targets.some(t => t.id === id)) {
                        targets.push({ id: id, name: 'N/A', source: 'Mencionado en el mensaje' });
                    }
                });
            }
            return targets;
        };
        const targetUsers = getTargetUsers();

        const text = `
[CONTEXTO]
- Fecha y Hora: ${new Date().toLocaleString('es-ES', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}

[QUIÉN SOY YO (LA IA)]
- Mi ID: ${m.bot.id}
- Mi Nombre: ${m.bot.name}

[QUIÉN SOLICITA]
- ID: ${m.sender.id}
- Nombre: ${m.sender.name}
- Es Propietario Real: ${m.sender.roles.rowner ? 'Sí' : 'No'}
- Es Propietario: ${m.sender.roles.owner ? 'Sí' : 'No'}
- Es Moderador: ${m.sender.roles.modr ? 'Sí' : 'No'}
- Es Admin del Grupo: ${m.sender.roles.admin ? 'Sí' : 'No'}

[DÓNDE ESTAMOS]
- Tipo de Chat: ${m.chat.isGroup ? 'Grupo' : 'Privado'}
- ID del Chat: ${m.chat.id}
${m.chat.isGroup ? `
- Nombre del Grupo: "${m.chat.name}"
- Miembros: ${m.chat.participants.length}
- Soy Admin aquí: ${m.bot.roles.admin ? 'Sí' : 'No'}
- Grupo en modo "Solo Admins": ${m.chat.metaData.announce ? 'Sí' : 'No'}` : ''}

[MENSAJE DEL USUARIO]
- Tipo de Contenido: ${m.content.media ? m.type.replace('Message', '').toUpperCase() : 'Texto'}
- Contiene Multimedia: ${m.content.media ? 'Sí' : 'No'}
- Texto: "${m.text}"

[POSIBLES_USUARIOS_OBJETIVO]
${targetUsers.length > 0 ? targetUsers.map(u => `- ID: ${u.id}, Nombre: ${u.name || '(sin nombre visible)'}, Fuente: ${u.source}`).join('\n') : '- Ninguno'}
${m.quoted ? `
[CONTENIDO DEL MENSAJE CITADO (AL QUE SE RESPONDE)]
- Autor Original ID: ${m.quoted.sender.id}
- Autor Original Nombre: "${m.quoted.sender.name}"
- Tipo de Contenido: ${m.quoted.type.replace('Message', '').toUpperCase()}
- Contiene Multimedia: ${m.quoted.content.media ? 'Sí' : 'No'}
- Texto: "${m.quoted.content.text}"` : ''}
`;

        const parts = [{ text: text }]

        const chat = model.startChat({
            history: db.data[m.sender.id],
        });

        const result = await chat.sendMessage(parts);

        const response = result.response;
        const functionCalls = response.functionCalls
            ? response.functionCalls() : null;

        if (functionCalls?.[0]) {
            let object = []

            if (typeof response.text == 'function') {
                const text = response.text().trim();
                if (text) {
                    const message = await sock.sendMessage(m.chat.id,
                        { text: text.trim() }, { quoted: m.message });

                    await sock.setReplyHandler(message, {
                        security: {
                            userId: m.sender.id,
                            chatId: m.chat.id,
                        },
                        routes: [{
                            code: {
                                executor: (m, { sock }) => {
                                    return m.body = '.jun ' + m.body
                                }
                            }
                        }]
                    })
                }
            }

            const functionResponses = [];

            for (const functionCall of functionCalls) {
                const { name, args } = functionCall;
                if (!tc[name]) continue;

                const toolResult = await tc[name].script({
                    m, sock, args,
                    object, plugin
                })

                functionResponses.push({
                    functionResponse: {
                        name: name,
                        response: {
                            result: toolResult
                        }
                    }
                });
            }

            if (functionResponses.length > 0) {
                const finalResult = await chat.sendMessage(functionResponses);
                const finalText = finalResult.response.text();

                if (finalText) {
                    const message = await sock.sendMessage(m.chat.id, { text: finalText.trim() }, { quoted: m.message });
                    await sock.setReplyHandler(message, {
                        security: {
                            userId: m.sender.id,
                            chatId: m.chat.id,
                        },
                        routes: [{
                            code: {
                                executor: (m, { sock }) => {
                                    return m.body = '.jun ' + m.body
                                }
                            }
                        }]
                    })
                }
            }

            if (object[0]) {
                for (const obj of object) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const message = await sock.sendMessage(m.chat.id, obj, { quoted: m.message });
                    await sock.setReplyHandler(message, {
                        security: {
                            userId: m.sender.id,
                            chatId: m.chat.id,
                        },
                        routes: [{
                            code: {
                                executor: (m, { sock }) => {
                                    return m.body = '.jun ' + m.body
                                }
                            }
                        }]
                    })
                }
            }
        } else {
            const text_ia = response.text().trim();
            const message = await sock.sendMessage(m.chat.id, { text: text_ia }, { quoted: m.message });
            await sock.setReplyHandler(message, {
                security: {
                    userId: m.sender.id,
                    chatId: m.chat.id,
                },
                routes: [{
                    code: {
                        executor: (m, { sock }) => {
                            return m.body = '.jun ' + m.body
                        }
                    }
                }]
            })
        }

        const newHistory = await chat.getHistory();
        db.data[m.sender.id] = newHistory.map(h =>
            ({ role: h.role, parts: h.parts }));
        await db.update();

    } catch (e) {
        console.error(e);
        await m.react('error');

        const error429 = [
            "Oye, oye, más despacio. Ni que fuera yo un bot multi-tarea... ah, espera. Bueno, igual dame un minuto para recargar el ingenio.",
            "Tanta prisa... ¿Acaso me pagan por horas extra? Respira hondo y espera un minuto.",
            "Eh, tranquilo. Mi cerebro de silicio necesita un respiro. Dame un minuto."
        ]

        if (e.status === 429) {
            let errorText = error429[Math.floor(Math.random()
                * error429.length)];

            const message = await sock.sendMessage(m.chat.id, { text: errorText }, { quoted: m.message });
            await sock.setReplyHandler(message, {
                security: {
                    userId: m.sender.id,
                    chatId: m.chat.id,
                },
                routes: [{
                    code: {
                        executor: (m, { sock }) => {
                            return m.body = '.jun ' + m.body
                        }
                    }
                }]
            })

            await m.react('error');
        } else {
            console.error(e);
            await m.react('error');
        }
    }

}

export default plugin;