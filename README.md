# Jun-Base

---

## Introducción

**SimpleBase** de WhatsApp utilizando la librería `@whiskeysockets/baileys`.

### Características principales:
- Sistema de plugins con recarga en caliente (hot-reload)
- Conexión mediante código QR o código de 8 dígitos
- Base de datos JSON integrada
- Sistema de roles y permisos
- Gestión automática de grupos
- Handlers de respuestas personalizables
- Cache inteligente para optimización

---

## Instalación

### Requisitos previos
- Node.js v18 o superior
- npm o yarn

### Pasos de instalación

```bash
# 1. Clonar o descargar el proyecto
git clone https://github.com/Zeppth/Jun-Base
cd Jun-Base

# 2. Instalar dependencias
npm install

# 3. Iniciar el bot
npm start
```

### Estructura de carpetas

```
SimpleBase 1.2.5/
├── config.js              # Configuración global
├── index.js               # Punto de entrada principal
├── core/
│   ├── config.js          # Configuración del core
│   ├── index.js           # Inicializador del core
│   ├── main.js            # Lógica principal del bot
│   ├── format.js          # Esquema de tipos
│   └── handlers/          # Manejadores de mensajes
├── library/               # Librerías utilitarias
├── plugins/               # Carpeta de plugins
└── storage/
    ├── creds/             # Credenciales de sesión
    ├── store/             # Base de datos
    └── temp/              # Archivos temporales
```

---

## Inicio - QR y Pairing Code

Al ejecutar el bot por primera vez, se te preguntará cómo deseas conectarte:

### Opción 1: Código QR

```
~> ¿Cómo desea conectarse?
1. Código QR.
2. Código de 8 dígitos.
~> 1
```

Se mostrará un código QR en la terminal. Escanéalo desde WhatsApp:
1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el código QR

### Opción 2: Código de 8 dígitos (Pairing Code)

```
~> ¿Cómo desea conectarse?
1. Código QR.
2. Código de 8 dígitos.
~> 2

~> ¿Cuál es el número que desea asignar como Bot?
~> 5491123456789
```

Se generará un código de 8 dígitos (ej: `ABCD-EFGH`). Ingrésalo en WhatsApp:
1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Selecciona **Vincular con número de teléfono**
5. Ingresa el código mostrado

---

## Objeto `m` (Mensaje)

El objeto `m` contiene toda la información del mensaje entrante y métodos para interactuar con él.

### Estructura completa

```javascript
m = {
    // Identificadores
    id: String,              // ID único del mensaje
    type: String,            // Tipo de mensaje (conversation, imageMessage, etc.)
    message: Object,         // Mensaje raw de Baileys
    
    // Contenido del mensaje
    body: String,            // Texto del mensaje
    command: String,         // Comando ejecutado (sin prefijo)
    args: Array,             // Argumentos del comando
    text: String,            // Texto después del comando
    tag: Array,              // Tags extraídos (tag=valor)
    isCmd: Boolean,          // ¿Es un comando?
    plugin: Object,          // Plugin que coincide con el comando
    
    // Objetos principales
    bot: Object,             // Información del bot
    chat: Object,            // Información del chat
    sender: Object,          // Información del remitente
    content: Object,         // Contenido procesado
    quoted: Object,          // Mensaje citado (si existe)
    
    // Métodos
    reply: Function,         // Responder al mensaje
    react: Function,         // Reaccionar al mensaje
    sms: Function,           // Enviar mensaje predefinido
}
```

---

### `m.bot` - Información del Bot

```javascript
m.bot = {
    id: String,              // ID del bot (@lid)
    name: String,            // Nombre del bot
    number: String,          // Número sin formato
    fromMe: Boolean,         // ¿El mensaje es del bot?
    
    roles: {
        admin: Boolean,      // ¿Es admin del grupo?
    },
    
    // Métodos asíncronos
    getDesc: Function,       // Obtener descripción del perfil
    getPhoto: Function,      // Obtener foto de perfil
    setPhoto: Function,      // Cambiar foto de perfil
    setDesc: Function,       // Cambiar descripción
    setName: Function,       // Cambiar nombre
    join: Function,          // Unirse a grupo por link
    mute: Function,          // Silenciar/desilenciar chat
    block: Function,         // Bloquear/desbloquear usuario
    role: Function,          // Verificar roles
}
```

**Ejemplos de uso:**

```javascript
// Obtener foto del bot
const photo = await m.bot.getPhoto();

// Cambiar descripción del bot
await m.bot.setDesc("Soy un bot de WhatsApp");

// Unirse a un grupo
await m.bot.join("AbCdEfGhIjK"); // Código de invitación

// Silenciar un chat por 8 horas
await m.bot.mute(m.chat.id, true);

// Bloquear usuario
await m.bot.block("5491123456789@lid", true);

// Verificar si el bot tiene un rol
if (await m.bot.role('admin')) {
    // El bot es administrador
}
```

---

### `m.chat` - Información del Chat

```javascript
m.chat = {
    id: String,              // ID del chat
    isGroup: Boolean,        // ¿Es un grupo?
    name: String,            // Nombre del grupo/chat
    desc: String,            // Descripción del grupo
    size: Number,            // Cantidad de participantes
    created: Number,         // Timestamp de creación
    owner: String,           // Creador del grupo
    participants: Array,     // Lista de participantes
    admins: Array,           // Lista de administradores
    
    // Métodos (solo grupos)
    db: Function,            // Acceso a base de datos del chat
    add: Function,           // Agregar participante
    remove: Function,        // Remover participante
    promote: Function,       // Promover a admin
    demote: Function,        // Degradar de admin
    getPhoto: Function,      // Obtener foto del grupo
    setPhoto: Function,      // Cambiar foto del grupo
    setDesc: Function,       // Cambiar descripción
    setName: Function,       // Cambiar nombre del grupo
    getCodeInvite: Function, // Obtener código de invitación
    getLinkInvite: Function, // Obtener link de invitación
    revoke: Function,        // Revocar link de invitación
    loadMessage: Function,   // Cargar mensaje por ID
    
    settings: {
        lock: Function,      // Bloquear/desbloquear configuración
        announce: Function,  // Modo solo admins
        memberAdd: Function, // Quién puede agregar miembros
        joinApproval: Function, // Aprobación de entrada
    },
}
```

**Ejemplos de uso:**

```javascript
// Verificar si es grupo
if (m.chat.isGroup) {
    console.log(`Grupo: ${m.chat.name}`);
    console.log(`Participantes: ${m.chat.size}`);
}

// Agregar usuario al grupo
await m.chat.add("5491123456789@lid");

// Promover a administrador
await m.chat.promote("5491123456789@lid");

// Obtener link de invitación
const link = await m.chat.getLinkInvite();
await m.reply(`Link: ${link}`);

// Activar modo solo administradores
await m.chat.settings.announce(true);

// Base de datos del chat
const chatDb = await m.chat.db();
chatDb.data.settings.welcome = true;
await chatDb.update();
```

---

### `m.sender` - Información del Remitente

```javascript
m.sender = {
    id: String,              // ID del remitente
    name: String,            // Nombre (pushName)
    number: String,          // Número sin formato
    user: String,            // @número (para menciones)
    mentioned: Array,        // Usuarios mencionados
    
    roles: {
        root: Boolean,       // Dueño absoluto
        owner: Boolean,      // Propietario
        mod: Boolean,        // Moderador
        vip: Boolean,        // Usuario premium
        admin: Boolean,      // Admin del grupo
        bot: Boolean,        // ¿Es el bot?
    },
    
    // Métodos
    getDesc: Function,       // Obtener descripción
    getPhoto: Function,      // Obtener foto de perfil
    role: Function,          // Verificar roles
}
```

**Ejemplos de uso:**

```javascript
// Obtener información del remitente
console.log(`Mensaje de: ${m.sender.name}`);
console.log(`Número: ${m.sender.number}`);

// Verificar roles
if (await m.sender.role('owner', 'mod')) {
    // El usuario es owner O moderador
}

if (m.sender.roles.admin) {
    // El usuario es admin del grupo
}

if (m.sender.roles.vip) {
    // El usuario es VIP
}

// Obtener foto de perfil
const photo = await m.sender.getPhoto();
```

---

### `m.content` - Contenido del Mensaje

```javascript
m.content = {
    text: String,            // Texto del mensaje
    args: Array,             // Texto dividido por espacios
    
    media: {                 // Solo si hay imagen/video
        mimeType: String,    // Tipo MIME
        fileName: String,    // Nombre del archivo
        download: Function,  // Descargar media
    } | false,
}
```

**Ejemplos de uso:**

```javascript
// Obtener texto
console.log(m.content.text);

// Verificar si hay media
if (m.content.media) {
    const buffer = await m.content.media.download();
    console.log(`Tipo: ${m.content.media.mimeType}`);
}
```

---

### `m.quoted` - Mensaje Citado

```javascript
m.quoted = {
    id: String,              // ID del mensaje citado
    type: String,            // Tipo de mensaje
    
    sender: {
        id: String,
        name: String,
        number: String,
        roles: Object,
        getDesc: Function,
        getPhoto: Function,
        role: Function,
    },
    
    content: {
        text: String,
        args: Array,
        media: Object | false,
    },
}
```

**Ejemplos de uso:**

```javascript
// Verificar si hay mensaje citado
if (m.quoted) {
    console.log(`Citando a: ${m.quoted.sender.name}`);
    console.log(`Texto citado: ${m.quoted.content.text}`);
    
    // Descargar media citada
    if (m.quoted.content.media) {
        const buffer = await m.quoted.content.media.download();
    }
}
```

---

### Métodos de `m`

#### `m.reply(text | object)`

Responde al mensaje actual.

```javascript
// Responder con texto
await m.reply("Hola mundo!");

// Responder con menciones automáticas
await m.reply("Hola @123456789");

// Responder con objeto (imagen, video, etc.)
await m.reply({
    image: { url: "https://example.com/image.jpg" },
    caption: "Una imagen"
});

await m.reply({
    video: buffer,
    caption: "Un video"
});
```

#### `m.react(emoji | key)`

Reacciona al mensaje con un emoji.

```javascript
// Usar emoji directamente
await m.react("👍");

// Usar keys predefinidas
await m.react("wait");   // ⌛
await m.react("done");   // ✔️
await m.react("error");  // ✖️
```

#### `m.sms(type)`

Envía un mensaje predefinido del sistema.

```javascript
// Mensajes disponibles:
await m.sms('root');     // Solo dueño
await m.sms('owner');    // Solo propietario
await m.sms('mod');      // Solo moderador
await m.sms('vip');      // Solo VIP
await m.sms('group');    // Solo en grupos
await m.sms('private');  // Solo en privado
await m.sms('admin');    // Solo admins
await m.sms('botAdmin'); // Bot necesita ser admin
```

---

## 🔌 Objeto `sock` (Socket)

El objeto `sock` extiende las funcionalidades de Baileys con métodos adicionales.

### Propiedades

```javascript
sock = {
    user: Object,            // Información del usuario conectado
    plugins: Plugins,        // Gestor de plugins
    store: Object,           // Store de mensajes
    subBot: Boolean,         // ¿Es un sub-bot?
    
    // Métodos de Baileys (heredados)
    sendMessage: Function,
    groupMetadata: Function,
    // ... todos los métodos de Baileys
    
    // Métodos extendidos
    Baileys: Function,
    downloadMedia: Function,
    sendWAMContent: Function,
    setReplyHandler: Function,
    loadMessage: Function,
}
```

### Métodos Extendidos

#### `sock.downloadMedia(message, type)`

Descarga media de un mensaje.

```javascript
// Descargar como buffer
const buffer = await sock.downloadMedia(m.message);

// Descargar como stream
const stream = await sock.downloadMedia(m.message, 'stream');
```

#### `sock.sendWAMContent(jid, message, options)`

Envía un mensaje generado con WAProto.

```javascript
const message = $proto.Message.fromObject({
    // estructura del mensaje
});
await sock.sendWAMContent(m.chat.id, message);
```

#### `sock.setReplyHandler(message, options, expiresIn)`

Crea un handler para respuestas a un mensaje específico.

```javascript
const sent = await m.reply("¿Cuál es tu nombre?");

await sock.setReplyHandler(sent, {
    security: {
        userId: m.sender.id,     // Solo este usuario puede responder
        chatId: m.chat.id,       // Solo en este chat
        scope: 'all',            // 'all' | 'private' | 'group'
    },
    lifecycle: {
        consumeOnce: true,       // Eliminar después de usar
    },
    state: {
        step: 'name',            // Estado personalizado
        data: {},                // Datos adicionales
    },
    routes: [
        {
            priority: 1,
            code: {
                guard: (m, ctx) => {
                    // Retorna true para SALTAR esta ruta
                    return m.content.text.length < 2;
                },
                executor: async (m, ctx) => {
                    await m.reply(`Hola ${m.content.text}!`);
                }
            }
        }
    ]
}, 1000 * 60 * 5); // Expira en 5 minutos
```

#### `sock.loadMessage(jid, id)`

Carga un mensaje del historial (requiere `saveHistory: true`).

```javascript
const oldMessage = await sock.loadMessage(m.chat.id, "messageId");
```

---

## Plugins

Los plugins son el corazón de SimpleBase. Permiten extender las funcionalidades del bot de manera modular.

### Ubicación

Todos los plugins deben estar en la carpeta `./plugins/` y tener la extensión `.plugin.js`.

```
plugins/
├── comandos/
│   ├── ping.plugin.js
│   └── menu.plugin.js
├── eventos/
│   ├── welcome.plugin.js
│   └── goodbye.plugin.js
├── utils/
│   └── antilink.plugin.js
└── exports/
    └── helpers.plugin.js
```

### Estructura de un Plugin

```javascript
// ./plugins/ejemplo.plugin.js

export default {
    // Metadatos
    name: "Nombre del Plugin",
    description: "Descripción del plugin",
    
    // Configuración del comando
    case: ["comando", "alias1", "alias2"],
    usePrefix: true,
    command: true,
    
    // Permisos requeridos
    root: false,
    owner: false,
    mod: false,
    vip: false,
    group: false,
    private: false,
    admin: false,
    botAdmin: false,
    
    // Función principal
    script: async (m, { sock, plugin, store }) => {
        await m.reply("¡Hola!");
    }
}
```

---

## Tipos de Plugins

### 1. Command Plugins

Plugins que responden a comandos específicos.

#### Plugin Básico

```javascript
// ./plugins/ping.plugin.js

export default {
    name: "Ping",
    description: "Verifica la latencia del bot",
    case: ["ping", "p"],
    usePrefix: true,
    command: true,
    
    script: async (m, { sock }) => {
        const start = Date.now();
        await m.react("wait");
        const latency = Date.now() - start;
        await m.reply(`🏓 Pong! ${latency}ms`);
        await m.react("done");
    }
}
```

#### Plugin con Argumentos

```javascript
// ./plugins/say.plugin.js

export default {
    name: "Say",
    description: "Repite el texto enviado",
    case: ["say", "decir"],
    usePrefix: true,
    command: true,
    
    script: async (m, { sock }) => {
        // m.text = todo después del comando
        // m.args = array de argumentos
        
        if (!m.text) {
            return m.reply("❌ Escribe algo para repetir\n\nEjemplo: .say Hola mundo");
        }
        
        await m.reply(m.text);
    }
}
```

#### Plugin con Permisos

```javascript
// ./plugins/ban.plugin.js

export default {
    name: "Ban",
    description: "Expulsa a un usuario del grupo",
    case: ["ban", "kick"],
    usePrefix: true,
    command: true,
    
    // Requisitos
    group: true,        // Solo en grupos
    admin: true,        // Usuario debe ser admin
    botAdmin: true,     // Bot debe ser admin
    
    script: async (m, { sock }) => {
        // Obtener usuario a banear
        let target = m.quoted?.sender.id || m.sender.mentioned[0];
        
        if (!target) {
            return m.reply("❌ Menciona o cita a alguien");
        }
        
        await m.react("wait");
        
        try {
            await m.chat.remove(target);
            await m.reply(`✅ Usuario expulsado`);
            await m.react("done");
        } catch (e) {
            await m.reply(`❌ Error: ${e.message}`);
            await m.react("error");
        }
    }
}
```

#### Plugin con Media

```javascript
// ./plugins/sticker.plugin.js

export default {
    name: "Sticker",
    description: "Convierte imagen/video a sticker",
    case: ["sticker", "s"],
    usePrefix: true,
    command: true,
    
    script: async (m, { sock }) => {
        // Verificar si hay media
        const media = m.content.media || m.quoted?.content.media;
        
        if (!media) {
            return m.reply("❌ Envía o cita una imagen/video");
        }
        
        await m.react("wait");
        
        const buffer = await media.download();
        
        await sock.sendMessage(m.chat.id, {
            sticker: buffer
        }, { quoted: m.message });
        
        await m.react("done");
    }
}
```

#### Plugin sin Prefijo

```javascript
// ./plugins/hola.plugin.js

export default {
    name: "Saludo",
    description: "Responde a saludos",
    case: ["hola", "hi", "hello"],
    usePrefix: false,    // Sin prefijo
    command: true,
    
    script: async (m, { sock }) => {
        const saludos = ["¡Hola!", "¡Hey!", "¡Qué tal!"];
        const random = saludos[Math.floor(Math.random() * saludos.length)];
        await m.reply(`${random} ${m.sender.name} 👋`);
    }
}
```

---

### 2. Before Plugins

Plugins que se ejecutan ANTES del procesamiento de comandos. Útiles para filtros, logs, anti-spam, etc.

#### Índices de Before

- **index: 1** - Se ejecuta primero, antes de todo
- **index: 2** - Se ejecuta después del procesamiento del chat grupal
- **index: 3** - Se ejecuta después del parsing del comando

#### Before Index 1 - Anti-Spam

```javascript
// ./plugins/antispam.plugin.js

const userMessages = new Map();
const LIMIT = 10;          // Mensajes máximos
const TIME = 1000 * 10;    // En 10 segundos

export default {
    name: "AntiSpam",
    description: "Detecta y bloquea spam",
    before: true,
    index: 1,
    
    script: async (m, { sock, control }) => {
        // Ignorar al bot
        if (m.sender.roles.bot) return;
        if (await m.sender.role('owner', 'mod')) return;
        
        const now = Date.now();
        const key = m.sender.id;
        
        if (!userMessages.has(key)) {
            userMessages.set(key, []);
        }
        
        const timestamps = userMessages.get(key);
        timestamps.push(now);
        
        // Filtrar mensajes antiguos
        const recent = timestamps.filter(t => now - t < TIME);
        userMessages.set(key, recent);
        
        if (recent.length > LIMIT) {
            await m.reply("⚠️ Spam detectado. Por favor, espera.");
            control.end = true; // Detiene el procesamiento
        }
    }
}
```

#### Before Index 2 - Logger

```javascript
// ./plugins/logger.plugin.js

import fs from 'fs/promises';

export default {
    name: "Logger",
    description: "Registra todos los mensajes",
    before: true,
    index: 2,
    
    script: async (m, { sock, control }) => {
        const log = {
            timestamp: new Date().toISOString(),
            chat: m.chat.id,
            chatName: m.chat.name || 'Privado',
            sender: m.sender.name,
            senderId: m.sender.id,
            message: m.content.text,
            type: m.type
        };
        
        // Guardar en archivo
        await fs.appendFile(
            './storage/logs.json',
            JSON.stringify(log) + '\n'
        );
        
        // No detener el procesamiento
        // control.end = false (por defecto)
    }
}
```

#### Before Index 3 - Verificador de Registro

```javascript
// ./plugins/checkregister.plugin.js

export default {
    name: "CheckRegister",
    description: "Verifica si el usuario está registrado",
    before: true,
    index: 3,
    
    script: async (m, { sock, control, store }) => {
        // Solo verificar si es un comando
        if (!m.isCmd) return;
        
        // Ignorar owners y mods
        if (await m.sender.role('owner', 'mod')) return;
        
        // Comandos exentos
        const exempt = ['registrar', 'reg', 'menu', 'help'];
        if (exempt.includes(m.command)) return;
        
        // Verificar registro
        const db = await global.db.open('@users');
        const user = db.data[m.sender.id];
        
        if (!user?.registered) {
            await m.sms('unreg');
            control.end = true;
        }
    }
}
```

---

### 3. StubType Plugins

Plugins que responden a eventos del sistema de WhatsApp (entradas, salidas, cambios de grupo, etc.).

#### Lista de StubTypes Comunes

| StubType | Descripción |
|----------|-------------|
| `GROUP_PARTICIPANT_ADD` | Usuario agregado al grupo |
| `GROUP_PARTICIPANT_REMOVE` | Usuario removido del grupo |
| `GROUP_PARTICIPANT_LEAVE` | Usuario salió del grupo |
| `GROUP_PARTICIPANT_PROMOTE` | Usuario promovido a admin |
| `GROUP_PARTICIPANT_DEMOTE` | Usuario degradado de admin |
| `GROUP_CHANGE_SUBJECT` | Nombre del grupo cambiado |
| `GROUP_CHANGE_DESCRIPTION` | Descripción cambiada |
| `GROUP_CHANGE_ICON` | Foto del grupo cambiada |

#### Welcome - Bienvenida

```javascript
// ./plugins/welcome.plugin.js

export default {
    name: "Welcome",
    description: "Da la bienvenida a nuevos miembros",
    case: "GROUP_PARTICIPANT_ADD",
    stubtype: true,
    
    script: async (m, { sock, parameters, even }) => {
        // parameters = array de usuarios agregados
        
        // Verificar si el welcome está activado
        const db = await m.chat.db();
        if (!db.data.settings?.welcome) return;
        
        for (const user of parameters) {
            const userId = user.endsWith('@lid') ? user : user + '@lid';
            
            const welcomeText = `
╭─────────────────╮
   *¡BIENVENIDO/A!* 🎉
╰─────────────────╯

👤 *Usuario:* @${userId.split('@')[0]}
📍 *Grupo:* ${m.chat.name}
👥 *Miembros:* ${m.chat.size}

📜 Lee las reglas y disfruta tu estadía.
            `.trim();
            
            await sock.sendMessage(m.chat.id, {
                text: welcomeText,
                contextInfo: {
                    mentionedJid: [userId]
                }
            });
        }
    }
}
```

#### Goodbye - Despedida

```javascript
// ./plugins/goodbye.plugin.js

export default {
    name: "Goodbye",
    description: "Despide a los miembros que salen",
    case: "GROUP_PARTICIPANT_LEAVE",
    stubtype: true,
    
    script: async (m, { sock, parameters }) => {
        const db = await m.chat.db();
        if (!db.data.settings?.goodbye) return;
        
        for (const user of parameters) {
            const userId = user.endsWith('@lid') ? user : user + '@lid';
            
            await sock.sendMessage(m.chat.id, {
                text: `👋 *@${userId.split('@')[0]}* ha abandonado el grupo.`,
                contextInfo: {
                    mentionedJid: [userId]
                }
            });
        }
    }
}
```

#### Promote/Demote

```javascript
// ./plugins/adminchange.plugin.js

export default {
    name: "AdminChange",
    description: "Notifica cambios de administrador",
    case: "GROUP_PARTICIPANT_PROMOTE",
    stubtype: true,
    
    script: async (m, { sock, parameters }) => {
        for (const user of parameters) {
            await sock.sendMessage(m.chat.id, {
                text: `👑 *@${user.split('@')[0]}* ahora es administrador.`,
                contextInfo: {
                    mentionedJid: [user]
                }
            });
        }
    }
}

// Plugin separado para demote
export const demotePlugin = {
    name: "AdminDemote",
    case: "GROUP_PARTICIPANT_DEMOTE",
    stubtype: true,
    
    script: async (m, { sock, parameters }) => {
        for (const user of parameters) {
            await sock.sendMessage(m.chat.id, {
                text: `📉 *@${user.split('@')[0]}* ya no es administrador.`,
                contextInfo: {
                    mentionedJid: [user]
                }
            });
        }
    }
}
```

---

### 4. Exports Plugins

Plugins que exportan funciones o utilidades para ser usadas por otros plugins.

#### Definir Exports

```javascript
// ./plugins/utils/helpers.plugin.js

// Funciones utilitarias
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const chunk = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

export default {
    name: "Helpers",
    description: "Funciones utilitarias",
    
    // Exportar las funciones
    export: {
        formatNumber,
        randomInt,
        sleep,
        chunk
    }
}
```

#### Usar Exports

```javascript
// ./plugins/ejemplo.plugin.js

export default {
    name: "Ejemplo",
    case: ["test"],
    usePrefix: true,
    command: true,
    
    script: async (m, { sock, plugin }) => {
        // Importar funciones exportadas
        const { formatNumber, randomInt, sleep } = plugin.import('helpers');
        
        const numero = randomInt(1, 1000000);
        await m.reply(`Número: ${formatNumber(numero)}`);
        
        await sleep(2000);
        await m.reply("¡2 segundos después!");
    }
}
```

#### Exports Avanzados - API Client

```javascript
// ./plugins/utils/api.plugin.js

import axios from 'axios';

class APIClient {
    constructor(baseURL) {
        this.client = axios.create({ baseURL });
    }
    
    async get(endpoint, params = {}) {
        try {
            const { data } = await this.client.get(endpoint, { params });
            return { success: true, data };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    async post(endpoint, body = {}) {
        try {
            const { data } = await this.client.post(endpoint, body);
            return { success: true, data };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

export default {
    name: "API Client",
    description: "Cliente HTTP para APIs",
    
    export: {
        APIClient,
        apis: {
            github: new APIClient('https://api.github.com'),
            weather: new APIClient('https://api.openweathermap.org'),
        }
    }
}
```

```javascript
// ./plugins/github.plugin.js

export default {
    name: "GitHub",
    case: ["github", "gh"],
    usePrefix: true,
    command: true,
    
    script: async (m, { plugin }) => {
        const { apis } = plugin.import('api');
        
        if (!m.text) {
            return m.reply("❌ Escribe un usuario de GitHub");
        }
        
        await m.react("wait");
        
        const result = await apis.github.get(`/users/${m.text}`);
        
        if (!result.success) {
            return m.reply(`❌ Error: ${result.error}`);
        }
        
        const user = result.data;
        await m.reply(`
👤 *${user.name || user.login}*
📍 ${user.location || 'No especificado'}
📊 Repos: ${user.public_repos}
👥 Seguidores: ${user.followers}
🔗 ${user.html_url}
        `.trim());
        
        await m.react("done");
    }
}
```

---

## Configuración

### Archivo `config.js`

```javascript
// ./config.js

import dotenv from 'dotenv';
dotenv.config();

// API Keys
global.googleApiKey = 'TU_API_KEY';

// Caracter para readMore
global.readMore = String.fromCharCode(8206).repeat(850);

// Configuración principal
global.config = {
    name: "NombreDelBot",
    prefixes: ".¿?¡!#%&/,~@",    // Prefijos permitidos
    saveHistory: true,            // Guardar historial
    autoRead: true                // Leer mensajes automáticamente
};

// Roles de usuarios
global.config.userRoles = {
    "5491123456789": {           // Número sin @ ni lid
        root: true,              // Acceso total
        owner: true,             // Propietario
        mod: true,               // Moderador
        vip: true                // VIP
    },
    "5491198765432": {
        owner: true,
        mod: true
    }
}

// Emojis de reacción
global.REACT_EMOJIS = {
    wait: "⌛",
    done: "✔️",
    error: "✖️"
}

// Mensajes del sistema
global.MSG = {
    root: 'Este comando solo puede ser utilizado por el dueño',
    owner: 'Este comando solo puede ser utilizado por un propietario',
    mod: 'Este comando solo puede ser utilizado por un moderador',
    vip: 'Esta solicitud es solo para usuarios premium',
    group: 'Este comando solo se puede usar en grupos',
    private: 'Este comando solo se puede usar por chat privado',
    admin: 'Este comando solo puede ser usado por administradores',
    botAdmin: 'El bot necesita ser administrador',
    unreg: 'Regístrese para usar esta función',
    restrict: 'Esta función está desactivada'
}
```

---

## Ejemplos Completos

### Sistema de Niveles

```javascript
// ./plugins/level.plugin.js

export default {
    name: "Level System",
    before: true,
    index: 2,
    
    script: async (m, { sock, control }) => {
        if (m.sender.roles.bot) return;
        if (!m.chat.isGroup) return;
        
        const db = await m.chat.db();
        const user = db.data.users[m.sender.id] ||= {
            xp: 0,
            level: 1
        };
        
        // Dar XP aleatorio
        const xpGained = Math.floor(Math.random() * 10) + 5;
        user.xp += xpGained;
        
        // Calcular nivel
        const xpNeeded = user.level * 100;
        
        if (user.xp >= xpNeeded) {
            user.xp -= xpNeeded;
            user.level += 1;
            
            await sock.sendMessage(m.chat.id, {
                text: `🎉 ¡Felicidades @${m.sender.number}!\n\n` +
                      `Has subido al nivel *${user.level}*`,
                contextInfo: {
                    mentionedJid: [m.sender.id]
                }
            });
        }
        
        await db.update();
    }
}
```

```javascript
// ./plugins/rank.plugin.js

export default {
    name: "Rank",
    case: ["rank", "nivel", "level"],
    usePrefix: true,
    command: true,
    group: true,
    
    script: async (m, { sock }) => {
        const db = await m.chat.db();
        const user = db.data.users[m.sender.id] || { xp: 0, level: 1 };
        const xpNeeded = user.level * 100;
        
        const progress = Math.floor((user.xp / xpNeeded) * 10);
        const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        
        await m.reply(`
📊 *Tu Rango*

👤 *Usuario:* ${m.sender.name}
⭐ *Nivel:* ${user.level}
✨ *XP:* ${user.xp}/${xpNeeded}

[${bar}] ${Math.floor((user.xp / xpNeeded) * 100)}%
        `.trim());
    }
}
```

### Sistema de Economía

```javascript
// ./plugins/economy.plugin.js

const formatMoney = (n) => n.toLocaleString('es-ES');

export default {
    name: "Economy",
    export: {
        formatMoney,
        
        getWallet: async (userId) => {
            const db = await global.db.open('@economy');
            db.data[userId] ||= { wallet: 0, bank: 0 };
            await db.update();
            return db.data[userId];
        },
        
        addMoney: async (userId, amount) => {
            const db = await global.db.open('@economy');
            db.data[userId] ||= { wallet: 0, bank: 0 };
            db.data[userId].wallet += amount;
            await db.update();
            return db.data[userId];
        }
    }
}
```

```javascript
// ./plugins/daily.plugin.js

export default {
    name: "Daily",
    case: ["daily", "diario"],
    usePrefix: true,
    command: true,
    
    script: async (m, { plugin }) => {
        const { getWallet, addMoney, formatMoney } = plugin.import('economy');
        
        const db = await global.db.open('@cooldowns');
        const lastDaily = db.data[m.sender.id]?.daily || 0;
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 horas
        
        if (now - lastDaily < cooldown) {
            const remaining = cooldown - (now - lastDaily);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            
            return m.reply(`⏰ Debes esperar *${hours}h ${minutes}m* para tu próximo daily.`);
        }
        
        const reward = Math.floor(Math.random() * 500) + 500;
        await addMoney(m.sender.id, reward);
        
        db.data[m.sender.id] ||= {};
        db.data[m.sender.id].daily = now;
        await db.update();
        
        const wallet = await getWallet(m.sender.id);
        
        await m.reply(`
💰 *Recompensa Diaria*

💵 Recibiste: $${formatMoney(reward)}
👛 Tu saldo: $${formatMoney(wallet.wallet)}

Vuelve mañana por más 🎁
        `.trim());
    }
}
```

---

## 🔧 Resumen de Propiedades de Plugins

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `name` | String | Nombre del plugin |
| `description` | String | Descripción |
| `case` | String/Array | Comando(s) que activan el plugin |
| `usePrefix` | Boolean | ¿Requiere prefijo? |
| `command` | Boolean | ¿Es un comando? |
| `before` | Boolean | ¿Es un before plugin? |
| `index` | Number | Orden de ejecución (1, 2, 3) |
| `stubtype` | Boolean | ¿Es un stubtype plugin? |
| `root` | Boolean | ¿Requiere ser root? |
| `owner` | Boolean | ¿Requiere ser owner? |
| `mod` | Boolean | ¿Requiere ser mod? |
| `vip` | Boolean | ¿Requiere ser vip? |
| `group` | Boolean | ¿Solo en grupos? |
| `private` | Boolean | ¿Solo en privado? |
| `admin` | Boolean | ¿Requiere ser admin? |
| `botAdmin` | Boolean | ¿Bot debe ser admin? |
| `export` | Object | Funciones a exportar |
| `script` | Function | Función principal |

---

## Soporte

- **Autor:** Zeppth
- **Licencia:** MIT
