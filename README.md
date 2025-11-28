# Jun-Base

SimpleBase de WhatsApp utilizando Baileys.

## Instalación

### Requisitos Previos
- Node.js v18 o superior
- npm o yarn

### Instalación Simple

```bash
git clone https://github.com/Zeppth/Jun-Base
cd Jun-Base
npm install
npm start
```

Durante el primer inicio, se te solicitará:
- **Método de conexión**: QR Code o Pairing Code
- **Número de teléfono** (si usas Pairing Code)

## Dependencias Principales

- `@whiskeysockets/baileys` - Cliente de WhatsApp
- `axios` - Cliente HTTP
- `cheerio` - Web scraping
- `jimp` - Procesamiento de imágenes
- `moment-timezone` - Manejo de fechas
- `node-cache` - Sistema de caché

---

### Objeto `m` (Mensaje)

Información y métodos del mensaje:

#### Propiedades Básicas

```javascript
// Identificadores
m.id                    // ID único del mensaje
m.message              // Objeto raw del mensaje de Baileys
m.type                 // Tipo de mensaje: 'conversation', 'imageMessage', etc.

// Contenido
m.content.text         // Texto del mensaje
m.content.args         // Array de argumentos [palabra1, palabra2, ...]
m.content.media        // Información del media (si aplica)
  ├─ .mimeType        // Tipo MIME
  ├─ .fileName        // Nombre del archivo
  └─ .download()      // Función para descargar media

// Parser de comandos
m.body                 // Cuerpo completo del mensaje
m.text                 // Texto sin el comando
m.args                 // Argumentos del comando
m.command              // Comando detectado (sin prefijo)
m.isCmd                // Boolean: ¿es un comando?
m.plugin               // Plugin asociado (si aplica)
m.tag                  // Tags personalizados del mensaje
```

#### m.bot - Información del Bot

```javascript
m.bot.id              // ID del bot (@s.whatsapp.net)
m.bot.name            // Nombre del bot
m.bot.fromMe          // Boolean: ¿el mensaje es del bot?
m.bot.roles           // Roles del bot

// Métodos
await m.bot.getDesc()           // Obtener descripción
await m.bot.getPhoto()          // Obtener foto de perfil
await m.bot.setPhoto(image)     // Cambiar foto
await m.bot.setDesc(desc)       // Cambiar descripción
await m.bot.setName(name)       // Cambiar nombre
await m.bot.join(link)          // Unirse a grupo
await m.bot.mute(id, true)      // Silenciar chat
await m.bot.block(id, true)     // Bloquear usuario
```

#### m.sender - Información del Remitente

```javascript
m.sender.id           // ID del remitente
m.sender.name         // Nombre del remitente
m.sender.mentioned    // Array de usuarios mencionados
m.sender.roles        // Roles del usuario
  ├─ .bot            // ¿Es el bot?
  ├─ .rowner         // ¿Es propietario raíz?
  ├─ .owner          // ¿Es propietario?
  ├─ .modr           // ¿Es moderador?
  └─ .prem           // ¿Es premium?

// Métodos
await m.sender.getDesc()        // Obtener descripción
await m.sender.getPhoto()       // Obtener foto
await m.sender.role('owner')    // Verificar rol
```

#### m.chat - Información del Chat

```javascript
m.chat.id             // ID del chat
m.chat.isGroup        // Boolean: ¿es grupo?
m.chat.name           // Nombre del grupo (si aplica)

// Métodos para Grupos
await m.chat.add(user)          // Agregar participante
await m.chat.remove(user)       // Remover participante
await m.chat.promote(user)      // Promover a admin
await m.chat.demote(user)       // Degradar admin
await m.chat.getPhoto()         // Obtener foto del grupo
await m.chat.setPhoto(image)    // Cambiar foto
await m.chat.setDesc(desc)      // Cambiar descripción
await m.chat.setName(name)      // Cambiar nombre
await m.chat.getCodeInvite()    // Obtener código de invitación
await m.chat.getLinkInvite()    // Obtener link de invitación
await m.chat.getMessage(id)     // Obtener mensaje del historial
await m.chat.revoke()           // Revocar link
await m.chat.db()               // Base de datos del chat.

// Configuraciones del Grupo
await m.chat.settings.lock(true)        // Bloquear configuración
await m.chat.settings.announce(true)    // Solo admins pueden enviar
await m.chat.settings.memberAdd(true)   // Miembros pueden agregar
await m.chat.settings.joinApproval(true) // Requiere aprobación
```

#### m.quoted - Mensaje Citado

Cuando un mensaje es una respuesta a otro:

```javascript
m.quoted.id           // ID del mensaje citado
m.quoted.type         // Tipo de mensaje citado
m.quoted.content      // Contenido del mensaje citado
  ├─ .text
  ├─ .args
  └─ .media
```

#### Métodos de Respuesta

```javascript
// Responder con texto
await m.reply('Hola mundo')
await m.reply('Mención: @123456789')  // Auto-detecta menciones

// Responder con objeto
await m.reply({
    image: buffer,
    caption: 'Imagen con caption'
})

// Reaccionar al mensaje
await m.react('✅')
await m.react('done')   // ✔️
await m.react('wait')   // ⌛
await m.react('error')  // ✖️

// Mensajes predefinidos
m.sms('owner')    // Solo para propietarios
m.sms('group')    // Solo para grupos
m.sms('admin')    // Solo para admins
```

#### m.cache - Sistema de Caché

```javascript
m.cache.sender.desc(id)       // Caché de descripciones
m.cache.sender.photo(id)      // Caché de fotos
m.cache.group.photo(id)       // Caché de fotos de grupo
m.cache.group.inviteCode(id)  // Caché de códigos de invitación
```

### Objeto `sock` (Socket de Baileys)

Extensión del cliente de Baileys con métodos adicionales:

```javascript
// Métodos de Baileys estándar
await sock.sendMessage(jid, content, options)
await sock.readMessages([messageKey])
await sock.updateProfilePicture(jid, buffer)
// ... todos los métodos de Baileys

// Métodos personalizados de SimpleBase
// ReplyHandler - Sistema de respuestas contextuales
await sock.setReplyHandler(message, {
    security: { userId, chatId },
    lifecycle: { expiresAt, consumeOnce },
    routes: [{ priority, code: { guard, executor } }],
    state: { /* variables personalizadas */ }
})

// Plugins
sock.plugins.get({ case: 'comando', command: true })
sock.plugins.import('@nombre')
sock.plugins.export('@nombre', objeto)
```

---

## 🔌 Sistema de Plugins

SimpleBase utiliza un sistema de plugins modular con 4 tipos principales:

### Tipos de Plugins

#### 1. **before** - Middleware Pre-procesamiento
Ejecutan **antes** del procesamiento del comando. Ideal para:
- Validaciones
- Filtros
- Modificación de mensajes
- Anti-spam
- Logging

#### 2. **stubtype** - Eventos de Grupo
Manejan eventos específicos de WhatsApp como:
- Usuarios agregados/removidos
- Cambios de configuración
- Promociones/degradaciones
- Cambios de nombre/descripción

#### 3. **export** - Módulos Compartidos
Exportan funciones y objetos para ser usados por otros plugins mediante `plugin.import('@nombre')`

#### 4. **command** - Comandos
Comandos ejecutables por usuarios

### Índices de Ejecución (before)

Los plugins `before` tienen un sistema de índices que determina cuándo se ejecutan:

```javascript
// Flujo de ejecución:
index: 1  → Antes de leer mensajes
index: 2  → Después de procesar stubtype, antes de parsear comando
index: 3  → Después de parsear, antes de ejecutar comando
```

### Estructura Base de un Plugin

```javascript
const plugin = {
    // Configuración
    before: true,           // ¿Es un middleware?
    index: 3,              // Orden de ejecución (1-3)
    stubtype: false,       // ¿Maneja eventos?
    command: true,         // ¿Es comando?
    
    // Para comandos
    case: ['comando', 'cmd'],  // Aliases del comando
    usage: ['.comando <arg>'], // Uso del comando
    category: ['utilidad'],    // Categoría
    usePrefix: true,           // ¿Requiere prefijo?
    
    // Exportaciones
    export: {
        '@nombre': { /* objeto/funciones */ }
    },
    
    // Función principal
    script: async (m, { sock, plugin, store, control }) => {
        // Lógica del plugin
    }
}

export default plugin
```

### Parámetros del Script

```javascript
plugin.script = async (m, context) => {
    // m: objeto del mensaje
    
    // context.sock: socket de Baileys
    // context.plugin: gestor de plugins
    //   - plugin.import('@nombre')
    //   - plugin.get({ case: 'cmd' })
    //   - plugin.export('@nombre', obj)
    
    // context.store: almacenamiento
    // context.control: control de flujo (solo before)
    //   - control.end = true  // Detiene ejecución
    
    // context.parameters: parámetros (solo stubtype)
    // context.even: nombre del evento (solo stubtype)
}
```

---

## 📖 Recursos Adicionales

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)

---

## 💬 Soporte

Para soporte y preguntas:
- **Autor**: Zeppth
- **Issues**: [GitHub Issues](https://github.com/Zeppth/Jun-Base/issues)

---
