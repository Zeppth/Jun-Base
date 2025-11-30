# Documentación Técnica Oficial
## La Base — Sistema Modular para Automatización de Mensajería

**Versión**: 1.2.5
**Autor**: Zeppth
**Licencia**: Propietaria

---

# Tabla de Contenidos

1. [Introducción Arquitectónica](#1-introducción-arquitectónica)
2. [Fundamentos del Objeto m](#2-fundamentos-del-objeto-m)
3. [Arquitectura de Plugins](#3-arquitectura-de-plugins)
4. [Sistema de Persistencia](#4-sistema-de-persistencia)
5. [Gestión de Procesos](#5-gestión-de-procesos)
6. [Ejemplos de Implementación](#6-ejemplos-de-implementación)
7. [Referencia de API](#7-referencia-de-api)

---

# 1. Introducción Arquitectónica

## 1.1 Visión General

El Núcleo implementa una arquitectura de procesamiento de mensajes basada en pipeline, donde cada mensaje entrante atraviesa una cadena de handlers que construyen progresivamente un objeto de contexto unificado denominado `m`.

```mermaid
graph TD
    %% Estilos definidos para claridad visual
    classDef init fill:#eeeeee,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    classDef data fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    classDef methods fill:#fff3e0,stroke:#ef6c00,stroke-width:1px;
    classDef logic fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;

    %% Nodos del Pipeline
    
    Init([core.handler.js <br/> Estado Inicial]):::init
    
    subgraph Pipeline [ CONSTRUCCIÓN PROGRESIVA DEL OBJETO m ]
        direction TB
        
        Step1[m.cache.js <br/> + m.cache: { group, sender }]:::data
        Step2[m.bot.js <br/> + m.bot: { id, name, roles... }]:::data
        Step3[m.chat.js <br/> + m.chat: { id, isGroup, db... }]:::data
        Step4[m.sender.js <br/> + m.sender: { id, name, roles... }]:::data
        
        Step5[m.content.js <br/> + m.content: { text, args, media } <br/> + m.quoted]:::data
        
        Step6[m.assign.js <br/> + m.reply, m.react, m.sms <br/> Métodos de utilidad]:::methods
        
        Step7[m.parser.js <br/> + m.command, m.args <br/> + m.isCmd, m.plugin]:::logic
    end

    %% Conexiones
    Init ==> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step5 --> Step6
    Step6 --> Step7

    %% Indicador final
    Step7 -.-> Ready((Objeto m <br/> Listo)):::init

## 1.2 Estructura de Directorios

```
@SimpleBase/
├── index.js                 # Punto de entrada principal
├── config.js                # Configuración global
├── package.json
│
├── core/
│   ├── index.js             # Inicialización del núcleo
│   ├── main.js              # Gestión de conexión WebSocket
│   ├── config.js            # Configuración interna del núcleo
│   ├── format.js            # Esquema tipado del objeto m
│   │
│   └── handlers/            # Pipeline de construcción del objeto m
│       ├── core.handler.js  # Orquestador principal
│       ├── m.cache.js       # Sistema de caché temporal
│       ├── m.bot.js         # Datos del bot
│       ├── m.chat.js        # Datos del chat
│       ├── m.chat.group.js  # Extensión para grupos
│       ├── m.sender.js      # Datos del remitente
│       ├── m.content.js     # Contenido del mensaje
│       ├── m.quoted.sender.js # Mensaje citado
│       ├── m.assign.js      # Métodos utilitarios
│       ├── m.parser.js      # Parser de comandos
│       ├── m.pre.parser.js  # Reply handlers
│       └── [+] extrator.content.js # Extractores por tipo
│
├── library/
│   ├── client.js            # Fábrica del cliente WhatsApp
│   ├── plugins.js           # Gestor de plugins
│   ├── db.js                # Sistema de persistencia JSON
│   ├── fork.js              # Gestión de procesos hijo
│   ├── bind.js              # Extensiones del socket
│   ├── loader.js            # Cargador de handlers con hot-reload
│   ├── process.js           # Abstracción de IPC
│   ├── log.js               # Sistema de logging
│   ├── purge.js             # Limpieza de temporales
│   ├── setup.js             # Asistente de configuración inicial
│   └── utils.js             # Utilidades (Timer, TmpStore, color)
│
├── plugins/                 # Directorio de plugins (usuario)
│   └── *.plugin.js
│
└── storage/
    ├── creds/               # Credenciales de sesión
    ├── store/               # Base de datos JSON
    └── temp/                # Archivos temporales
```

## 1.3 Flujo de Arranque

```
1. index.js
   └── Ejecuta runQuestion() para determinar método de conexión
   └── Instancia ForkManager con ./core/index.js
   └── Registra listeners de eventos (message, exit, error)
   └── Invoca mainBot.start()

2. core/index.js (proceso hijo)
   └── Carga config.js (global)
   └── Carga core/config.js (proto, paths, db)
   └── Inicializa handlerLoader
   └── Instancia Plugins(./plugins)
   └── Importa core/main.js

3. core/main.js
   └── Inicializa $base (sistema de persistencia)
   └── Carga handlers con handlerLoader.loadFiles()
   └── Carga plugins con plugins.load()
   └── Ejecuta StartBot()
       └── MakeBot() crea socket Baileys
       └── Asigna plugins al socket
       └── Registra eventos (connection.update, messages.upsert, call)
```

---

# 2. Fundamentos del Objeto m

## 2.1 Naturaleza del Objeto m

El objeto `m` constituye el contexto unificado de mensaje. No es un DTO estático, sino un objeto mutable que se enriquece progresivamente a través del pipeline de handlers. Cada handler añade propiedades y métodos específicos a su dominio.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONSTRUCCIÓN PROGRESIVA DEL OBJETO m                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │ m = { id }  │  ◄── Estado inicial (core.handler.js)                  │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.cache.js                              │                            │
│  │  └── m.cache = { group: {}, sender: {} }│                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.bot.js                                │                            │
│  │  └── m.bot = { id, name, roles, ... }   │                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.chat.js                               │                            │
│  │  └── m.chat = { id, isGroup, db(), ...} │                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.sender.js                             │                            │
│  │  └── m.sender = { id, name, roles, ...} │                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.content.js                            │                            │
│  │  └── m.content = { text, args, media }  │                            │
│  │  └── m.quoted = { ... } (si existe)     │                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.assign.js                             │                            │
│  │  └── m.reply = async (text) => ...      │                            │
│  │  └── m.react = async (text) => ...      │                            │
│  │  └── m.sms = (type) => ...              │                            │
│  └──────┬──────────────────────────────────┘                            │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────┐                            │
│  │ m.parser.js                             │                            │
│  │  └── m.command, m.args, m.text          │                            │
│  │  └── m.isCmd, m.plugin                  │                            │
│  └─────────────────────────────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Esquema Tipado Completo

El archivo `core/format.js` define el contrato estructural del objeto `m`. A continuación se presenta el esquema con anotaciones técnicas:

### 2.2.1 Propiedades Raíz

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `String` | Identificador único del mensaje (key.id de Baileys) |
| `type` | `String` | Tipo de mensaje (`conversation`, `imageMessage`, `extendedTextMessage`, etc.) |
| `message` | `Object` | Mensaje raw de Baileys sin procesar |
| `body` | `String` | Texto normalizado del mensaje |
| `command` | `String` | Comando extraído (sin prefijo) |
| `args` | `Array<String>` | Argumentos separados por espacios |
| `text` | `String` | Texto completo posterior al comando |
| `tag` | `Array<String>` | Tags extraídos del formato `tag=valor` |
| `isCmd` | `Boolean` | Indica si el mensaje coincide con un comando registrado |
| `plugin` | `Object\|null` | Referencia al plugin que procesará el mensaje |

### 2.2.2 Subobjeto m.bot

```javascript
m.bot = {
    id: String,           // JID del bot (formato @lid)
    name: String,         // Nombre del perfil
    number: String,       // Número sin dominio
    fromMe: Boolean,      // true si el mensaje proviene del bot
    
    roles: {
        admin: Boolean    // true si es admin del grupo actual
    },
    
    // Métodos asíncronos
    getDesc: async () => String,
    getPhoto: async () => String,  // URL de la foto
    setPhoto: async (Buffer) => void,
    setDesc: async (String) => void,
    setName: async (String) => void,
    join: async (inviteCode) => void,
    mute: async (jid, Boolean, time?) => void,
    block: async (jid, Boolean) => void,
    role: async (...roles) => Boolean
}
```

### 2.2.3 Subobjeto m.chat

```javascript
m.chat = {
    id: String,           // JID del chat (remoteJid)
    isGroup: Boolean,     // true si termina en @g.us
    name: String,         // Nombre del grupo (si aplica)
    desc: String,         // Descripción del grupo
    size: Number,         // Cantidad de participantes
    created: Number,      // Timestamp de creación
    owner: String,        // JID del propietario
    participants: Array,  // Lista de participantes
    admins: Array<String>,// JIDs de administradores
    
    // Métodos para grupos
    add: async (jid) => void,
    remove: async (jid) => void,
    promote: async (jid) => void,
    demote: async (jid) => void,
    getPhoto: async (type?, id?) => String,
    setPhoto: async (Buffer) => void,
    setDesc: async (String) => void,
    setName: async (String) => void,
    getCodeInvite: async () => String,
    getLinkInvite: async () => String,
    revoke: async () => void,
    
    settings: {
        lock: async (Boolean) => void,
        announce: async (Boolean) => void,
        memberAdd: async (Boolean) => void,
        joinApproval: async (Boolean) => void
    },
    
    // Acceso a base de datos del chat
    db: async () => { data: Object, update: async () => void }
}
```

### 2.2.4 Subobjeto m.sender

```javascript
m.sender = {
    id: String,           // JID del remitente
    name: String,         // pushName o nombre almacenado
    number: String,       // Número sin dominio
    user: String,         // Formato @número
    mentioned: Array<String>, // JIDs mencionados
    
    roles: {
        root: Boolean,    // Rol máximo (definido en config)
        owner: Boolean,   // Propietario del bot
        mod: Boolean,     // Moderador
        vip: Boolean,     // Usuario premium
        admin: Boolean,   // Admin del grupo actual
        bot: Boolean      // true si sender === bot
    },
    
    getDesc: async () => String,
    getPhoto: async () => String,
    role: async (...roles) => Boolean  // Verifica si tiene algún rol
}
```

### 2.2.5 Subobjeto m.content

```javascript
m.content = {
    text: String,         // Texto extraído según tipo de mensaje
    args: Array<String>,  // text.split(/ +/)
    
    media: {              // Solo si type es imageMessage o videoMessage
        mimeType: String,
        fileName: String,
        download: async () => Buffer
    } | false
}
```

### 2.2.6 Subobjeto m.quoted

Presente únicamente cuando el mensaje es una respuesta a otro mensaje:

```javascript
m.quoted = {
    id: String,
    type: String,
    
    sender: {
        id: String,
        name: String,
        number: String,
        roles: { ... },   // Misma estructura que m.sender.roles
        getDesc: async () => String,
        getPhoto: async () => String,
        role: async (...roles) => Boolean
    },
    
    content: {
        text: String,
        args: Array<String>,
        media: { ... } | false
    }
}
```

### 2.2.7 Métodos Utilitarios

```javascript
// Responder al mensaje
m.reply = async (text: String | Object) => Message

// Reaccionar al mensaje
m.react = async (emoji: String) => void
// Soporta alias: 'wait', 'done', 'error' → ⌛, ✔️, ✖️

// Enviar mensaje predefinido
m.sms = (type: String) => Message | undefined
// Tipos: 'root', 'owner', 'mod', 'vip', 'group', 'private', 
//        'admin', 'botAdmin', 'unreg', 'restrict'
```

## 2.3 Manipulación Correcta del Objeto m

### 2.3.1 Acceso Seguro a Propiedades

El objeto `m` se construye progresivamente. Acceder a propiedades antes de su inicialización producirá `undefined`.

```javascript
// INCORRECTO: Acceso prematuro en plugin before:index=1
export default {
    before: true,
    index: 1,
    script: async (m) => {
        // m.chat.admins aún no existe en index=1
        console.log(m.chat.admins); // undefined
    }
}

// CORRECTO: Verificar existencia
export default {
    before: true,
    index: 1,
    script: async (m) => {
        if (m.chat?.admins) {
            console.log(m.chat.admins);
        }
    }
}
```

### 2.3.2 Orden de Disponibilidad por Handler Index

| Index | Propiedades Disponibles |
|-------|-------------------------|
| 1 | `m.id`, `m.message`, `m.cache`, `m.bot`, `m.chat.id`, `m.chat.isGroup`, `m.sender.id`, `m.sender.name`, `m.content` |
| 2 | Todo lo anterior + `m.chat.admins`, `m.chat.participants`, `m.bot.roles.admin`, `m.sender.roles.admin` (si es grupo) |
| 3 | Todo lo anterior + `m.command`, `m.args`, `m.text`, `m.isCmd`, `m.plugin`, `m.body`, `m.tag` |

### 2.3.3 Mutabilidad y Efectos Secundarios

El objeto `m` es mutable. Las modificaciones persisten a lo largo del pipeline:

```javascript
// Plugin before:index=2
export default {
    before: true,
    index: 2,
    script: async (m, { control }) => {
        // Modificar m afecta plugins posteriores
        m.customFlag = true;
        m.sender.roles.custom = true;
    }
}

// Plugin de comando posterior
export default {
    case: 'test',
    command: true,
    script: async (m) => {
        console.log(m.customFlag);        // true
        console.log(m.sender.roles.custom); // true
    }
}
```

### 2.3.4 Control de Flujo

Los plugins `before` pueden interrumpir el pipeline:

```javascript
export default {
    before: true,
    index: 1,
    script: async (m, { control }) => {
        if (m.sender.roles.banned) {
            control.end = true;  // Detiene todo procesamiento posterior
            return;
        }
    }
}
```

---

# 3. Arquitectura de Plugins

## 3.1 Taxonomía de Plugins

El Núcleo reconoce tres categorías de plugins según sus propiedades declarativas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TAXONOMÍA DE PLUGINS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ 1. PLUGINS DE COMANDO                                          │    │
│  │    command: true                                               │    │
│  │    case: String | Array<String>                                │    │
│  │    usePrefix: Boolean (default: true)                          │    │
│  │                                                                 │    │
│  │    Se activan cuando m.command coincide con case               │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ 2. PLUGINS DE INTERCEPTACIÓN (BEFORE)                          │    │
│  │    before: true                                                │    │
│  │    index: 1 | 2 | 3                                            │    │
│  │                                                                 │    │
│  │    Se ejecutan en puntos específicos del pipeline              │    │
│  │    Pueden interrumpir el flujo con control.end = true          │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ 3. PLUGINS DE EVENTO (STUBTYPE)                                │    │
│  │    stubtype: true                                              │    │
│  │    case: String (nombre del evento WebMessageInfo.StubType)    │    │
│  │                                                                 │    │
│  │    Se activan con eventos del protocolo WhatsApp               │    │
│  │    Ejemplos: GROUP_PARTICIPANT_ADD, GROUP_PARTICIPANT_LEAVE    │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Anatomía de un Plugin

### 3.2.1 Estructura Base

Todo plugin debe exportar un objeto con la siguiente estructura mínima:

```javascript
// plugins/ejemplo.plugin.js
export default {
    // === IDENTIFICACIÓN ===
    case: 'comando',          // String o Array<String>
    
    // === CLASIFICACIÓN ===
    command: true,            // Plugin de comando
    // O bien:
    // before: true,          // Plugin de interceptación
    // index: 1,              // Punto de ejecución (1, 2 o 3)
    // O bien:
    // stubtype: true,        // Plugin de evento
    
    // === OPCIONES ===
    usePrefix: true,          // Requiere prefijo (default: true)
    
    // === LÓGICA ===
    script: async (m, context) => {
        // Implementación
    }
}
```

### 3.2.2 Objeto Context

El segundo parámetro de `script` contiene:

```javascript
{
    sock: Object,      // Socket de Baileys con extensiones
    plugin: Plugins,   // Instancia del gestor de plugins
    store: Object,     // Store de Baileys (si está habilitado)
    control: Object    // Solo en plugins before: { end: Boolean }
}
```

Para plugins `stubtype`, el contexto incluye propiedades adicionales:

```javascript
{
    sock: Object,
    plugin: Plugins,
    store: Object,
    even: String,           // Nombre del evento
    parameters: Array       // Parámetros del stub
}
```

## 3.3 Ciclo de Vida de Plugins

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CICLO DE VIDA DE UN PLUGIN                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │   CARGA     │  Plugins.load() → fs.readdir() → import()              │
│  │  INICIAL    │  Se almacena en Map con fileName como key              │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐                                                        │
│  │  REGISTRO   │  Se parsean propiedades (case, command, etc.)          │
│  │   EN MAP    │  Se mezclan con defaultObjects del constructor         │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐                                                        │
│  │ OBSERVACIÓN │  chokidar.watch() monitorea cambios                    │
│  │  (WATCHER)  │  Eventos: add, change, unlink                          │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ├──────────────────────┐                                        │
│         │                      │                                        │
│         ▼                      ▼                                        │
│  ┌─────────────┐        ┌─────────────┐                                 │
│  │   CAMBIO    │        │ ELIMINACIÓN │                                 │
│  │  (change)   │        │  (unlink)   │                                 │
│  │             │        │             │                                 │
│  │ delete(key) │        │ delete(key) │                                 │
│  │ reimport()  │        │             │                                 │
│  └─────────────┘        └─────────────┘                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         EJECUCIÓN                                │   │
│  │                                                                   │   │
│  │  messages.upsert → core.handler → plugins.get(query) → script() │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.4 Sistema de Consulta de Plugins

El método `plugins.get()` acepta un objeto de consulta que filtra plugins según sus propiedades:

```javascript
// Obtener plugins de comando que coincidan con "help"
const plugins = await sock.plugins.get({
    case: 'help',
    command: true,
    usePrefix: true
});

// Obtener plugins before con index 2
const beforePlugins = await sock.plugins.get({
    before: true,
    index: 2
});

// Obtener plugin de evento específico
const eventPlugin = await sock.plugins.get({
    case: 'GROUP_PARTICIPANT_ADD',
    stubtype: true
});
```

La lógica de coincidencia maneja múltiples escenarios:

| Query | Plugin | Coincide |
|-------|--------|----------|
| `case: 'help'` | `case: ['help', 'ayuda']` | Sí |
| `case: ['help', 'ayuda']` | `case: 'help'` | Sí |
| `case: ['a', 'b']` | `case: ['b', 'c']` | Sí (intersección) |

## 3.5 Creación de Plugins

### 3.5.1 Plugin de Comando Básico

```javascript
// plugins/saludar.plugin.js
export default {
    case: ['saludar', 'hola', 'hi'],
    command: true,
    usePrefix: true,
    
    script: async (m, { sock }) => {
        const hora = new Date().getHours();
        let saludo;
        
        if (hora < 12) saludo = 'Buenos días';
        else if (hora < 19) saludo = 'Buenas tardes';
        else saludo = 'Buenas noches';
        
        await m.reply(`${saludo}, ${m.sender.name}`);
    }
}
```

### 3.5.2 Plugin de Interceptación (Filtro de Spam)

```javascript
// plugins/antispam.plugin.js
const cooldowns = new Map();
const COOLDOWN_MS = 3000;

export default {
    before: true,
    index: 1,
    
    script: async (m, { control }) => {
        const key = m.sender.id;
        const now = Date.now();
        
        if (cooldowns.has(key)) {
            const lastTime = cooldowns.get(key);
            if (now - lastTime < COOLDOWN_MS) {
                control.end = true;
                return;
            }
        }
        
        cooldowns.set(key, now);
    }
}
```

### 3.5.3 Plugin de Evento (Bienvenida)

```javascript
// plugins/bienvenida.plugin.js
export default {
    case: 'GROUP_PARTICIPANT_ADD',
    stubtype: true,
    
    script: async (m, { sock, parameters }) => {
        const newMember = parameters[0];
        const groupName = m.chat.name || 'el grupo';
        
        await sock.sendMessage(m.chat.id, {
            text: `Bienvenido/a al grupo ${groupName}, @${newMember.split('@')[0]}`,
            mentions: [newMember]
        });
    }
}
```

## 3.6 Sistema de Exportación entre Plugins

Los plugins pueden exportar y consumir funcionalidades compartidas:

```javascript
// plugins/utilidades.plugin.js
export default {
    before: true,
    index: 1,
    
    export: {
        formatearNumero: (numero) => {
            return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        
        validarUrl: (texto) => {
            try {
                new URL(texto);
                return true;
            } catch {
                return false;
            }
        }
    },
    
    script: async (m) => {
        // Plugin mínimo, solo exporta
    }
}
```

Consumo desde otro plugin:

```javascript
// plugins/estadisticas.plugin.js
export default {
    case: 'stats',
    command: true,
    
    script: async (m, { plugin }) => {
        const utils = plugin.import('formatearNumero');
        const mensajes = 1500000;
        
        await m.reply(`Mensajes procesados: ${utils(mensajes)}`);
        // Output: "Mensajes procesados: 1,500,000"
    }
}
```

---

# 4. Sistema de Persistencia

## 4.1 Arquitectura del Módulo db.js

El sistema de persistencia implementa un almacén JSON con las siguientes características:

- Almacenamiento en archivos JSON individuales
- Índice centralizado para mapeo nombre → archivo
- Caché en memoria con TTL de 60 segundos
- Escritura diferida (lazy write)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SISTEMA DE PERSISTENCIA                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         MEMORIA                                  │   │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     │   │
│  │  │  $data.bases │     │$data.timeouts│     │ $data.index  │     │   │
│  │  │    (Map)     │     │    (Map)     │     │   (Object)   │     │   │
│  │  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     │   │
│  │         │                    │                    │             │   │
│  └─────────┼────────────────────┼────────────────────┼─────────────┘   │
│            │                    │                    │                  │
│            │         TTL: 60s   │                    │                  │
│            │         ┌──────────┘                    │                  │
│            │         │                               │                  │
│            ▼         ▼                               ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      SISTEMA DE ARCHIVOS                         │   │
│  │                                                                   │   │
│  │  storage/store/                                                  │   │
│  │  ├── index.json          { "@users": { "id": "A1B2" }, ... }     │   │
│  │  ├── A1B2.json           { "user1": { ... }, "user2": { ... } }  │   │
│  │  ├── C3D4.json           { ... }                                 │   │
│  │  └── ...                                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4.2 API del Sistema de Persistencia

### 4.2.1 Inicialización

```javascript
import db from './library/db.js';

// Inicializar con directorio de almacenamiento
await db.Start('./storage/store');
```

### 4.2.2 Operaciones CRUD

```javascript
// Verificar existencia
const existe = await db.has('@users');

// Abrir o crear base de datos
const usuarios = await db.open('@users');

// Acceder a datos
console.log(usuarios.data);

// Modificar datos
usuarios.data['nuevo_usuario'] = {
    nombre: 'Usuario',
    fecha: Date.now()
};

// Persistir cambios
await usuarios.update();

// Eliminar base de datos
await db.delete('@users');
```

### 4.2.3 Patrones de Uso en Plugins

```javascript
export default {
    case: 'registrar',
    command: true,
    
    script: async (m, { sock }) => {
        const db = await global.db.open('@users');
        
        if (db.data[m.sender.id]) {
            return m.reply('Ya estás registrado.');
        }
        
        db.data[m.sender.id] = {
            nombre: m.sender.name,
            registrado: Date.now(),
            nivel: 1,
            experiencia: 0
        };
        
        await db.update();
        await m.reply('Registro completado.');
    }
}
```

## 4.3 Bases de Datos Predefinidas

El Núcleo utiliza convenciones de nomenclatura para bases de datos internas:

| Nombre | Propósito |
|--------|-----------|
| `@users` | Datos globales de usuarios |
| `@chats` | Configuración de chats privados |
| `@chat:{jid}` | Datos específicos de un grupo |
| `@reply:Handler` | Reply handlers activos |
| `@history/{jid}` | Historial de mensajes por chat |
| `@history/{jid}/{sender}` | Historial por usuario en chat |

---

# 5. Gestión de Procesos

## 5.1 Arquitectura Multi-Proceso

El Núcleo implementa una arquitectura de proceso padre-hijo para aislar el bot principal:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA DE PROCESOS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    PROCESO PADRE (index.js)                     │    │
│  │                                                                  │    │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │    │
│  │  │ ForkManager │────▶│   Events    │────▶│   Console   │       │    │
│  │  │             │     │  Handlers   │     │   Output    │       │    │
│  │  └──────┬──────┘     └─────────────┘     └─────────────┘       │    │
│  │         │                                                       │    │
│  └─────────┼───────────────────────────────────────────────────────┘    │
│            │                                                             │
│            │ fork() + IPC                                                │
│            │                                                             │
│  ┌─────────▼───────────────────────────────────────────────────────┐    │
│  │                   PROCESO HIJO (core/index.js)                   │    │
│  │                                                                   │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │    │
│  │  │ Baileys │  │ Plugins │  │   DB    │  │ Handlers│            │    │
│  │  │  Socket │  │  System │  │  System │  │ Pipeline│            │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Comunicación Inter-Proceso (IPC)

### 5.2.1 Envío de Mensajes desde Proceso Hijo

```javascript
import $process from './library/process.js';

// Envío simple
$process.send({
    content: {
        type: 'custom:event',
        data: { mensaje: 'Hola desde el hijo' }
    }
});

// Envío con request/response
const respuesta = await $process.send({
    content: {
        type: 'request:data',
        data: { query: 'info' }
    }
}, 'request');
```

### 5.2.2 Recepción en Proceso Padre

```javascript
mainBot.event.set('message', async (m) => {
    const { type, data } = m.content || {};
    
    switch (type) {
        case 'custom:event':
            console.log('Recibido:', data.mensaje);
            break;
    }
});
```

## 5.3 Reinicio Automático

El `ForkManager` gestiona automáticamente el reinicio en caso de fallo:

```javascript
mainBot.event.set('exit', async ({ code, signal }) => {
    console.log(`Proceso terminado: code=${code}, signal=${signal}`);
    
    // Esperar antes de reiniciar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reiniciar
    await mainBot.start();
});
```

---

# 6. Ejemplos de Implementación

## 6.1 Ejemplo Básico: Bot de Comandos

Este ejemplo implementa un bot con comandos de información y utilidades básicas.

### 6.1.1 Estructura de Archivos

```
plugins/
├── info/
│   ├── ping.plugin.js
│   ├── menu.plugin.js
│   └── estado.plugin.js
└── utilidades/
    └── sticker.plugin.js
```

### 6.1.2 Plugin de Ping

```javascript
// plugins/info/ping.plugin.js
export default {
    case: ['ping', 'p'],
    command: true,
    usePrefix: true,
    
    script: async (m) => {
        const inicio = Date.now();
        const mensaje = await m.reply('Calculando latencia...');
        const latencia = Date.now() - inicio;
        
        await m.reply(`Latencia: ${latencia}ms`);
    }
}
```

### 6.1.3 Plugin de Menú Dinámico

```javascript
// plugins/info/menu.plugin.js
export default {
    case: ['menu', 'comandos', 'ayuda'],
    command: true,
    usePrefix: true,
    
    script: async (m, { plugin }) => {
        // Obtener todos los plugins de comando
        const comandos = await plugin.get({ command: true });
        
        // Agrupar por carpeta
        const grupos = {};
        for (const cmd of comandos) {
            const carpeta = cmd.fileName.split('/')[0] || 'general';
            grupos[carpeta] = grupos[carpeta] || [];
            
            const cases = Array.isArray(cmd.case) ? cmd.case : [cmd.case];
            grupos[carpeta].push({
                comandos: cases,
                prefijo: cmd.usePrefix !== false
            });
        }
        
        // Construir mensaje
        let texto = `*Menú de ${m.bot.name}*\n\n`;
        
        for (const [grupo, cmds] of Object.entries(grupos)) {
            texto += `*${grupo.toUpperCase()}*\n`;
            for (const cmd of cmds) {
                const prefijo = cmd.prefijo ? '.' : '';
                texto += `  ${prefijo}${cmd.comandos.join(' | ')}\n`;
            }
            texto += '\n';
        }
        
        await m.reply(texto);
    }
}
```

### 6.1.4 Plugin de Stickers

```javascript
// plugins/utilidades/sticker.plugin.js
import fs from 'fs/promises';
import path from 'path';

export default {
    case: ['sticker', 's'],
    command: true,
    usePrefix: true,
    
    script: async (m, { sock }) => {
        // Verificar que haya imagen
        let media = m.content.media;
        
        if (!media && m.quoted?.content?.media) {
            media = m.quoted.content.media;
        }
        
        if (!media) {
            return m.reply('Envía o responde a una imagen con el comando.');
        }
        
        await m.react('wait');
        
        try {
            const buffer = await media.download();
            
            await sock.sendMessage(m.chat.id, {
                sticker: buffer
            }, { quoted: m.message });
            
            await m.react('done');
        } catch (error) {
            await m.react('error');
            await m.reply('Error al crear el sticker.');
        }
    }
}
```

## 6.2 Ejemplo Avanzado: Sistema de Economía

Este ejemplo demuestra un sistema completo con persistencia, roles y flujos interactivos.

### 6.2.1 Estructura

```
plugins/
└── economia/
    ├── _init.plugin.js       # Inicialización y exportaciones
    ├── balance.plugin.js     # Consulta de saldo
    ├── daily.plugin.js       # Recompensa diaria
    ├── transferir.plugin.js  # Transferencias entre usuarios
    └── tienda.plugin.js      # Sistema de tienda con reply handlers
```

### 6.2.2 Plugin de Inicialización

```javascript
// plugins/economia/_init.plugin.js
const MONEDA = '💎';
const INICIAL = 1000;

const obtenerCuenta = async (userId) => {
    const db = await global.db.open('@economia');
    
    if (!db.data[userId]) {
        db.data[userId] = {
            balance: INICIAL,
            banco: 0,
            ultimoDaily: 0,
            inventario: [],
            creado: Date.now()
        };
        await db.update();
    }
    
    return {
        cuenta: db.data[userId],
        guardar: async () => await db.update()
    };
};

const formatearBalance = (cantidad) => {
    return `${cantidad.toLocaleString()} ${MONEDA}`;
};

export default {
    before: true,
    index: 1,
    
    export: {
        obtenerCuenta,
        formatearBalance,
        MONEDA,
        INICIAL
    },
    
    script: async () => {}
}
```

### 6.2.3 Plugin de Balance

```javascript
// plugins/economia/balance.plugin.js
export default {
    case: ['balance', 'bal', 'saldo'],
    command: true,
    usePrefix: true,
    
    script: async (m, { plugin }) => {
        const { obtenerCuenta, formatearBalance } = plugin.import('obtenerCuenta');
        const { cuenta } = await obtenerCuenta(m.sender.id);
        
        const texto = [
            `*Balance de ${m.sender.name}*`,
            '',
            `Efectivo: ${formatearBalance(cuenta.balance)}`,
            `Banco: ${formatearBalance(cuenta.banco)}`,
            `Total: ${formatearBalance(cuenta.balance + cuenta.banco)}`
        ].join('\n');
        
        await m.reply(texto);
    }
}
```

### 6.2.4 Plugin de Recompensa Diaria

```javascript
// plugins/economia/daily.plugin.js
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const RECOMPENSA_BASE = 500;

export default {
    case: ['daily', 'diario'],
    command: true,
    usePrefix: true,
    
    script: async (m, { plugin }) => {
        const eco = plugin.import('obtenerCuenta');
        const { cuenta, guardar } = await eco.obtenerCuenta(m.sender.id);
        
        const ahora = Date.now();
        const diferencia = ahora - cuenta.ultimoDaily;
        
        if (diferencia < COOLDOWN) {
            const restante = COOLDOWN - diferencia;
            const horas = Math.floor(restante / (60 * 60 * 1000));
            const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
            
            return m.reply(`Debes esperar ${horas}h ${minutos}m para tu próxima recompensa.`);
        }
        
        // Calcular recompensa con streak
        const diasConsecutivos = diferencia < COOLDOWN * 2 
            ? (cuenta.streak || 0) + 1 
            : 1;
        
        const bonificacion = Math.min(diasConsecutivos * 50, 500);
        const recompensa = RECOMPENSA_BASE + bonificacion;
        
        cuenta.balance += recompensa;
        cuenta.ultimoDaily = ahora;
        cuenta.streak = diasConsecutivos;
        
        await guardar();
        
        await m.reply([
            `*Recompensa Diaria*`,
            '',
            `+${eco.formatearBalance(recompensa)}`,
            `Racha: ${diasConsecutivos} días`,
            `Nuevo balance: ${eco.formatearBalance(cuenta.balance)}`
        ].join('\n'));
    }
}
```

### 6.2.5 Plugin de Tienda con Reply Handlers

```javascript
// plugins/economia/tienda.plugin.js
const CATALOGO = [
    { id: 'vip_1d', nombre: 'VIP 1 Día', precio: 5000, tipo: 'rol' },
    { id: 'vip_7d', nombre: 'VIP 7 Días', precio: 25000, tipo: 'rol' },
    { id: 'lootbox', nombre: 'Caja Misteriosa', precio: 1000, tipo: 'item' }
];

export default {
    case: ['tienda', 'shop'],
    command: true,
    usePrefix: true,
    
    script: async (m, { sock, plugin }) => {
        const eco = plugin.import('obtenerCuenta');
        const { cuenta } = await eco.obtenerCuenta(m.sender.id);
        
        let texto = `*Tienda*\n\nTu balance: ${eco.formatearBalance(cuenta.balance)}\n\n`;
        
        CATALOGO.forEach((item, index) => {
            texto += `${index + 1}. ${item.nombre} - ${eco.formatearBalance(item.precio)}\n`;
        });
        
        texto += '\nResponde con el número del artículo que deseas comprar.';
        
        const mensaje = await m.reply(texto);
        
        // Registrar reply handler
        await sock.setReplyHandler(mensaje, {
            security: {
                userId: m.sender.id,
                chatId: m.chat.id,
                scope: 'all'
            },
            lifecycle: {
                consumeOnce: true
            },
            state: {
                catalogo: CATALOGO,
                compradorId: m.sender.id
            },
            routes: [
                {
                    priority: 1,
                    code: {
                        guard: `(m, ctx) => {
                            const seleccion = parseInt(m.content.text);
                            return isNaN(seleccion) || 
                                   seleccion < 1 || 
                                   seleccion > ctx.state.catalogo.length;
                        }`,
                        executor: `async (m, ctx) => {
                            const seleccion = parseInt(m.content.text) - 1;
                            const item = ctx.state.catalogo[seleccion];
                            
                            const db = await global.db.open('@economia');
                            const cuenta = db.data[ctx.state.compradorId];
                            
                            if (cuenta.balance < item.precio) {
                                return m.reply('Balance insuficiente.');
                            }
                            
                            cuenta.balance -= item.precio;
                            cuenta.inventario.push({
                                id: item.id,
                                obtenido: Date.now()
                            });
                            
                            await db.update();
                            
                            await m.reply(
                                'Compra exitosa: ' + item.nombre + 
                                '\\nNuevo balance: ' + cuenta.balance
                            );
                        }`
                    }
                }
            ]
        }, 1000 * 60 * 5); // 5 minutos de expiración
    }
}
```

### 6.2.6 Plugin de Transferencias

```javascript
// plugins/economia/transferir.plugin.js
export default {
    case: ['transferir', 'pay', 'enviar'],
    command: true,
    usePrefix: true,
    
    script: async (m, { plugin }) => {
        const eco = plugin.import('obtenerCuenta');
        
        // Validar argumentos
        if (m.sender.mentioned.length === 0) {
            return m.reply('Menciona al usuario destinatario.\nEjemplo: .transferir @usuario 1000');
        }
        
        const cantidad = parseInt(m.args[1]);
        if (isNaN(cantidad) || cantidad <= 0) {
            return m.reply('Especifica una cantidad válida.');
        }
        
        const destinatarioId = m.sender.mentioned[0];
        
        if (destinatarioId === m.sender.id) {
            return m.reply('No puedes transferirte a ti mismo.');
        }
        
        // Obtener cuentas
        const { cuenta: origen, guardar: guardarOrigen } = await eco.obtenerCuenta(m.sender.id);
        const { cuenta: destino, guardar: guardarDestino } = await eco.obtenerCuenta(destinatarioId);
        
        // Validar balance
        if (origen.balance < cantidad) {
            return m.reply(`Balance insuficiente. Tienes ${eco.formatearBalance(origen.balance)}`);
        }
        
        // Ejecutar transferencia
        origen.balance -= cantidad;
        destino.balance += cantidad;
        
        await guardarOrigen();
        await guardarDestino();
        
        await m.reply([
            '*Transferencia Exitosa*',
            '',
            `Enviado: ${eco.formatearBalance(cantidad)}`,
            `Destinatario: @${destinatarioId.split('@')[0]}`,
            `Tu nuevo balance: ${eco.formatearBalance(origen.balance)}`
        ].join('\n'));
    }
}
```

---

# 7. Referencia de API

## 7.1 Objeto sock (Socket Extendido)

### 7.1.1 Métodos Heredados de Baileys

Todos los métodos de `@whiskeysockets/baileys` están disponibles. Referencia completa en la documentación oficial de Baileys.

### 7.1.2 Métodos Inyectados por el Núcleo

```javascript
// Descargar media de un mensaje
sock.downloadMedia(message: Object, type?: 'buffer' | 'stream') => Promise<Buffer>

// Enviar mensaje con contenido generado
sock.sendWAMContent(jid: String, message: Object, options?: Object) => Promise<Object>

// Registrar un reply handler
sock.setReplyHandler(
    message: Object,           // Mensaje al que se responderá
    options: {
        security?: {
            userId?: String,   // 'all' o JID específico
            chatId?: String,   // 'all' o JID específico
            scope?: String     // 'all' | 'private' | 'group'
        },
        lifecycle?: {
            consumeOnce?: Boolean,  // Eliminar tras primera respuesta
            expiresAt?: Number      // Timestamp de expiración
        },
        state?: Object,        // Estado personalizado
        routes: Array<{
            priority: Number,
            code: {
                guard?: String,    // Función como string
                executor: String   // Función como string
            }
        }>
    },
    expiresIn?: Number         // Milisegundos hasta expiración
) => Promise<void>

// Cargar mensaje del historial
sock.loadMessage(jid: String, messageId: String) => Promise<Object | null>

// Acceso a Baileys
sock.Baileys() => Promise<BaileysModule>
```

## 7.2 Clase Plugins

```javascript
// Verificar si existe un plugin
plugins.has(fileName: String) => Boolean

// Eliminar un plugin del registro
plugins.delete(fileName: String) => Boolean

// Importar exportación de un plugin
plugins.import(key: String) => any

// Exportar funcionalidad
plugins.export(key: String, value: any) => any

// Cargar plugins del directorio
plugins.load() => Promise<void>

// Registrar un plugin manualmente
plugins.set(fileName: String) => Promise<void>

// Consultar plugins
plugins.get(query: Object | String) => Promise<Array<Plugin>>
```

## 7.3 Módulo db (Persistencia)

```javascript
import db from './library/db.js';

// Inicializar sistema
db.Start(folderPath: String) => Promise<db>

// Verificar existencia
db.has(name: String) => Promise<Boolean>

// Abrir base de datos
db.open(name: String) => Promise<{
    data: Object,
    update: () => Promise<Boolean>
}>

// Eliminar base de datos
db.delete(name: String) => Promise<Boolean>
```

## 7.4 Clase ForkManager

```javascript
import { ForkManager } from './library/fork.js';

const manager = new ForkManager(filePath: String, options: {
    execArgv?: Array<String>,
    cwd?: String,
    serialization?: 'json' | 'advanced',
    env: Object
});

// Registrar evento
manager.event.set(name: 'message' | 'error' | 'exit', handler: Function) => Boolean

// Eliminar evento
manager.event.delete(name: String) => Boolean

// Iniciar proceso
manager.start(callback?: Function) => Promise<void>

// Detener proceso
manager.stop(callback?: Function) => Promise<void>

// Enviar mensaje
manager.send(content: Object, type?: 'send' | 'request') => Promise<void | Object>

// Estado del proceso
manager.status => { process: ChildProcess }

// Tiempo activo
manager.uptime => Number | null
```

## 7.5 Utilidades

### 7.5.1 SimpleTimer

```javascript
import { SimpleTimer } from './library/utils.js';

const timer = new SimpleTimer(
    callback: Function,
    duration: Number,
    type?: 'timeout' | 'interval'
);

timer.start() => void
timer.stop() => void
timer.status => Boolean
```

### 7.5.2 TmpStore

```javascript
import { TmpStore } from './library/utils.js';

const store = new TmpStore(ttl?: Number);  // Default: 60000ms

store.set(key: String, value: any) => Promise<any>
store.get(key: String) => any
store.has(key: String) => Boolean
store.delete(key: String) => Boolean
store.clear() => void
store.keys() => Array<String>
store.values() => Array<any>
```

### 7.5.3 Color (Terminal)

```javascript
import { color } from './library/utils.js';

color.rgb(r: Number, g: Number, b: Number) => String  // Texto
color.bg.rgb(r: Number, g: Number, b: Number) => String  // Fondo
color.reset => String
```

---

# Apéndice A: Eventos StubType Soportados

Lista parcial de eventos de `WebMessageInfo.StubType` que pueden capturarse con plugins `stubtype: true`:

| Evento | Descripción |
|--------|-------------|
| `GROUP_PARTICIPANT_ADD` | Usuario añadido al grupo |
| `GROUP_PARTICIPANT_REMOVE` | Usuario eliminado del grupo |
| `GROUP_PARTICIPANT_LEAVE` | Usuario abandonó el grupo |
| `GROUP_PARTICIPANT_PROMOTE` | Usuario promovido a admin |
| `GROUP_PARTICIPANT_DEMOTE` | Admin degradado |
| `GROUP_CHANGE_SUBJECT` | Nombre del grupo cambiado |
| `GROUP_CHANGE_DESCRIPTION` | Descripción cambiada |
| `GROUP_CHANGE_ICON` | Icono del grupo cambiado |
| `GROUP_CHANGE_INVITE_LINK` | Link de invitación regenerado |
| `GROUP_CHANGE_RESTRICT` | Configuración de restricción cambiada |
| `GROUP_CHANGE_ANNOUNCE` | Modo solo admins cambiado |

---

# Apéndice B: Variables Globales

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `global.config` | Object | Configuración principal |
| `global.config.prefixes` | String | Caracteres de prefijo válidos |
| `global.config.userRoles` | Object | Roles predefinidos por número |
| `global.db` | Object | Instancia del sistema de persistencia |
| `global.sock` | Object | Socket de Baileys (disponible tras conexión) |
| `global.REACT_EMOJIS` | Object | Mapeo de alias a emojis |
| `global.MSG` | Object | Mensajes de sistema predefinidos |
| `global.$proto` | Object | Protobuf de WhatsApp |
| `global.$dir_main` | Object | Rutas de directorios principales |
| `global.readMore` | String | Carácter invisible para "leer más" |

---

**Fin del Documento**

*Versión de documentación: 1.0.0*
*Generada para SimpleBase 1.2.5*
