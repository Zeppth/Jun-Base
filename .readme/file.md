- `id: "3EB09392F8A1293",`
- `type: "extendedTextMessage",`
    
- `content: {`
    - `text: ".ban @573001234567",`
    - `args: [".ban", "@573001234567"],`
    - `media: false`
`},`
- `    // Referencia al mensaje respondido (si existe)
    quoted: {
        id: "3EB099999999999",                      // ID del mensaje al que se responde
        type: "imageMessage",                       // Tipo del mensaje original
        sender: { id: "573001234567@s..." }         // ID del autor original
    },`


/* ======================================================================================
       🟦 FASE 2: ENTIDADES Y UTILIDADES
       Se cargan identidades básicas y funciones de utilidad.
       Archivos: m.bot.js, m.chat.js, m.sender.js, m.assign.js
       ====================================================================================== */

    // Identidad del Bot
    bot: {
        id: "573000000000@lid",                     // ID interno del bot
        name: "Jun Bot",                            // Nombre de perfil del bot
        fromMe: false,                              // ¿El mensaje lo envié yo?
        roles: { admin: false },                    // (Se actualizará en Fase 3 si es grupo)
        
        // Métodos inyectados
        getDesc: [AsyncFunction],                   // Obtener descripción del bot
        setPhoto: [AsyncFunction],                  // Cambiar foto de perfil
        mute: [AsyncFunction],                      // Silenciar un chat
        block: [AsyncFunction]                      // Bloquear usuario
    },

    // Identidad del Chat (Datos básicos)
    chat: {
        id: "1203630239293@g.us",                   // JID del chat (Grupo o Privado)
        isGroup: true,                              // Booleano: ¿Es un grupo?
        
        // Métodos de gestión
        add: [AsyncFunction],                       // Añadir participantes
        remove: [AsyncFunction],                    // Eliminar participantes
        settings: { lock: [Function], ... }         // Configurar grupo (solo admins)
    },

    // Identidad del Remitente (Quien ejecuta el comando)
    sender: {
        id: "573112223333@s.whatsapp.net",          // JID del usuario
        name: "Admin Supremo",                      // PushName de WhatsApp
        number: "573112223333",                     // Número limpio
        mentioned: ["573001234567@s..."],           // Lista de @menciones en el mensaje
        
        // Roles de Base de Datos (system:BUC)
        roles: {
            bot: false,                             // ¿Es el bot?
            rowner: false,                          // ¿Es Real Owner? (Dev)
            owner: true,                            // ¿Es Owner del Bot?
            modr: true,                             // ¿Es Moderador del Bot?
            prem: true                              // ¿Es usuario Premium?
        },
        
        // Métodos
        role: [AsyncFunction],                      // Verificar roles: m.sender.role('owner')
        getPhoto: [AsyncFunction]                   // Obtener foto del usuario
    },

    // Utilidades de Respuesta Rápida
    reply: [AsyncFunction],                         // Responder texto: await m.reply('Hola')
    react: [AsyncFunction],                         // Reaccionar: await m.react('✅')
    sms: [Function],                                // Enviar mensaje de sistema: m.sms('admin')


    /* --------------------------------------------------------------------------------------
       🛑 PUNTO DE CONTROL: Plugins 'before' (Index: 1)
       El bot tiene datos básicos. Aún no sabe admins del grupo ni comandos.
       Ideal para: Anti-Spam bruto, Logs de mensajes.
       -------------------------------------------------------------------------------------- */


    /* ======================================================================================
       🟦 FASE 3: METADATA DE GRUPO (Solo si es Grupo)
       Se descargan y procesan los datos pesados del grupo.
       Archivos: m.chat.group.js
       ====================================================================================== */

    // Actualización del objeto Chat
    chat: {
        // ... (datos previos) ...
        name: "Comunidad Anime",                    // Nombre del grupo
        desc: "Reglas: No Gore, No Spam...",        // Descripción del grupo
        size: 154,                                  // Cantidad de participantes
        owner: "573009999999@s...",                 // Creador del grupo
        participants: [ ... ],                      // Array completo de participantes
        admins: ["573112223333@s...", ...],         // Lista de IDs de los administradores
        metaData: { ... }                           // Metadata cruda de Baileys
    },

    // Actualización de Roles (Contexto de Grupo)
    sender: {
        // ...
        roles: {
            // ... (roles previos) ...
            admin: true                             // <--- ¡NUEVO! Detectado como Admin del grupo
        }
    },
    
    bot: {
        // ...
        roles: {
            admin: true                             // <--- ¡NUEVO! Sabemos si el Bot es Admin
        }
    },


    /* --------------------------------------------------------------------------------------
       🛑 PUNTO DE CONTROL: Plugins 'before' (Index: 2)
       Datos completos del grupo disponibles.
       Ideal para: Sistemas de Niveles, RPG, Gestión de Usuarios.
       -------------------------------------------------------------------------------------- */


    /* ======================================================================================
       🟦 FASE 4: PARSER (Detección de Comandos)
       Se analiza el texto buscando prefijos y comandos registrados.
       Archivos: m.parser.js
       ====================================================================================== */

    body: ".ban @573001234567",                     // Texto final limpio
    args: ["@573001234567"],                        // Argumentos (sin el comando)
    text: "@573001234567",                          // Texto de argumentos unido string
    
    command: "ban",                                 // El comando detectado (sin prefijo)
    isCmd: true,                                    // ¿Existe un plugin para este comando?
    
    // Referencia al plugin que se va a ejecutar
    plugin: {                                       
        case: ["ban", "kick"],
        category: ["admin"],
        script: [AsyncFunction]                     // La función lógica del comando
    },


    /* --------------------------------------------------------------------------------------
       🛑 PUNTO DE CONTROL: Plugins 'before' (Index: 3)
       Último paso antes de ejecutar el comando.
       Ideal para: Chatbots IA (responder si isCmd es false), Auto-Respuestas.
       -------------------------------------------------------------------------------------- */


    /* ======================================================================================
       🟩 FASE FINAL: EJECUCIÓN
       Se ejecuta: await m.plugin.script(m, { sock, ... })
       ====================================================================================== */
}