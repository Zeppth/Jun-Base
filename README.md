# 📱 SimpleBase - Framework para Bots de WhatsApp

SimpleBase es un framework modular y extensible para crear bots de WhatsApp utilizando Baileys. Proporciona un sistema de plugins robusto, objetos enriquecidos y una arquitectura escalable.

## 🚀 Instalación

### Requisitos Previos
- Node.js v18 o superior
- npm o yarn

### Instalación Simple

```bash
# Clonar o descargar el proyecto
cd @SimpleBase

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env

# Iniciar el bot
npm start
```

Durante el primer inicio, se te solicitará:
- **Método de conexión**: QR Code o Pairing Code
- **Número de teléfono** (si usas Pairing Code)

## 📦 Dependencias Principales

- `@whiskeysockets/baileys` - Cliente de WhatsApp
- `@google/generative-ai` - Integración con IA de Google
- `axios` - Cliente HTTP
- `cheerio` - Web scraping
- `jimp` - Procesamiento de imágenes
- `moment-timezone` - Manejo de fechas
- `node-cache` - Sistema de caché

---

## 🎯 Objetos y Funciones Principales

SimpleBase proporciona objetos enriquecidos que facilitan el desarrollo de plugins:

### Objeto `m` (Mensaje)

El objeto `m` es el núcleo del framework, contiene toda la información y métodos del mensaje:

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
m.bot.number          // Número de teléfono del bot
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
m.sender.number       // Número de teléfono
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
await m.chat.revoke()           // Revocar link

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
await sock.getFrom(source, 'buffer')    // Obtener desde URL/path/buffer
await sock.getJSON(url)                 // Fetch JSON
await sock.downloadMedia(message)       // Descargar media
await sock.resizePhoto({ image, scale: 720 })
await sock.uploadFiloTmp(file)          // Subir a tmpfiles.org

// ReplyHandler - Sistema de respuestas contextuales
await sock.setReplyHandler(message, {
    security: { userId, chatId, scope },
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

## 💡 Ejemplos Avanzados de Plugins

### 1. Before Plugin - Sistema Anti-Spam con IA

Un sistema inteligente que detecta spam, flooding y contenido inapropiado usando IA:

```javascript
// plugins/@anti-spam.before.plugin.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const plugin = {
    before: true,
    index: 1,
    export: {
        '@spam-detector': {
            userMessages: new Map(),
            suspiciousPatterns: [],
            
            async analyzeWithAI(text, history) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                
                const prompt = `Analiza si este mensaje es spam. Historial reciente: ${JSON.stringify(history)}
Mensaje actual: "${text}"

Responde SOLO con formato JSON:
{
    "isSpam": boolean,
    "confidence": 0-100,
    "reason": "motivo",
    "severity": "low|medium|high"
}`;
                
                const result = await model.generateContent(prompt);
                return JSON.parse(result.response.text());
            },
            
            getMessageHistory(userId) {
                if (!this.userMessages.has(userId)) {
                    this.userMessages.set(userId, []);
                }
                return this.userMessages.get(userId);
            },
            
            addMessage(userId, message, timestamp) {
                const history = this.getMessageHistory(userId);
                history.push({ message, timestamp });
                
                // Mantener solo últimos 10 mensajes
                if (history.length > 10) history.shift();
                
                // Limpiar mensajes antiguos (>5 min)
                const fiveMinAgo = Date.now() - 5 * 60 * 1000;
                const filtered = history.filter(h => h.timestamp > fiveMinAgo);
                this.userMessages.set(userId, filtered);
            }
        }
    }
}

plugin.script = async (m, { sock, plugin: pluginManager, control, store }) => {
    // Ignorar bots y comandos
    if (m.sender.roles.bot || m.isCmd) return;
    
    const detector = pluginManager.import('@spam-detector');
    const db = await store.open('anti-spam:users');
    
    if (!db.data.warnings) db.data.warnings = {};
    if (!db.data.banned) db.data.banned = {};
    
    // Verificar si está baneado
    if (db.data.banned[m.sender.id]) {
        await m.react('🚫');
        control.end = true;
        return;
    }
    
    const userId = m.sender.id;
    const now = Date.now();
    
    // Agregar mensaje al historial
    detector.addMessage(userId, m.content.text, now);
    const history = detector.getMessageHistory(userId);
    
    // Detectar flooding (muchos mensajes rápidos)
    const recentMessages = history.filter(h => now - h.timestamp < 10000);
    if (recentMessages.length > 5) {
        await m.reply('⚠️ *Anti-Spam Activado*\nDetectamos flooding. Ralentiza tus mensajes.');
        db.data.warnings[userId] = (db.data.warnings[userId] || 0) + 1;
        await db.update();
        
        // Ban después de 3 advertencias
        if (db.data.warnings[userId] >= 3) {
            db.data.banned[userId] = { reason: 'Flooding', timestamp: now };
            await db.update();
            
            if (m.chat.isGroup && m.sender.role('admin')) {
                await m.chat.remove(m.sender.id);
            }
            await m.reply('🚫 *Usuario Baneado*\nRazón: Flooding excesivo');
        }
        
        control.end = true;
        return;
    }
    
    // Análisis con IA (solo si hay suficiente texto)
    if (m.content.text.length > 20) {
        try {
            const analysis = await detector.analyzeWithAI(m.content.text, history);
            
            if (analysis.isSpam && analysis.confidence > 70) {
                await m.react('⚠️');
                
                const warningMsg = `🤖 *Detección de Spam IA*
                
📊 Confianza: ${analysis.confidence}%
📝 Razón: ${analysis.reason}
⚡ Severidad: ${analysis.severity}

⚠️ Advertencia ${db.data.warnings[userId] + 1}/3`;
                
                await m.reply(warningMsg);
                
                db.data.warnings[userId] = (db.data.warnings[userId] || 0) + 1;
                await db.update();
                
                if (analysis.severity === 'high' || db.data.warnings[userId] >= 3) {
                    db.data.banned[userId] = { 
                        reason: analysis.reason, 
                        timestamp: now,
                        ai: true
                    };
                    await db.update();
                    control.end = true;
                }
            }
        } catch (e) {
            console.error('Error en análisis IA:', e);
        }
    }
    
    await db.update();
}

export default plugin;
```

### 2. Before Plugin - Sistema de Economía y RPG

Sistema completo de economía con tienda, inventario y misiones:

```javascript
// plugins/@economy-rpg.before.plugin.js

const plugin = {
    before: true,
    index: 2,
    export: {
        '@economy': {
            // Configuración de la economía
            config: {
                dailyReward: 100,
                workReward: { min: 50, max: 200 },
                missionReward: 500,
                levelUpReward: 1000
            },
            
            items: {
                'espada_hierro': { name: '⚔️ Espada de Hierro', price: 500, type: 'weapon', damage: 10 },
                'armadura_cuero': { name: '🛡️ Armadura de Cuero', price: 400, type: 'armor', defense: 8 },
                'pocion_vida': { name: '🧪 Poción de Vida', price: 50, type: 'consumable', heal: 50 },
                'espada_diamante': { name: '💎 Espada de Diamante', price: 5000, type: 'weapon', damage: 50 },
                'escudo_magico': { name: '🔮 Escudo Mágico', price: 3000, type: 'armor', defense: 30 }
            },
            
            missions: [
                { id: 'hunt_1', name: 'Cazar 5 Slimes', reward: 200, xp: 50, requirement: { kills: { slime: 5 } } },
                { id: 'collect_1', name: 'Recolectar 10 Minerales', reward: 300, xp: 75, requirement: { collect: 10 } },
                { id: 'boss_1', name: 'Derrotar Jefe Final', reward: 2000, xp: 500, requirement: { boss: true } }
            ],
            
            async getUserProfile(userId, db) {
                if (!db.data.users) db.data.users = {};
                if (!db.data.users[userId]) {
                    db.data.users[userId] = {
                        money: 0,
                        level: 1,
                        xp: 0,
                        inventory: [],
                        equipped: { weapon: null, armor: null },
                        stats: { hp: 100, maxHp: 100, damage: 5, defense: 0 },
                        missions: [],
                        achievements: [],
                        lastDaily: 0,
                        lastWork: 0
                    };
                }
                return db.data.users[userId];
            },
            
            calculateLevel(xp) {
                return Math.floor(Math.sqrt(xp / 100)) + 1;
            },
            
            getXpForNextLevel(level) {
                return Math.pow(level, 2) * 100;
            },
            
            async addMoney(userId, amount, db) {
                const profile = await this.getUserProfile(userId, db);
                profile.money += amount;
                await db.update();
                return profile.money;
            },
            
            async addXP(userId, amount, db, m) {
                const profile = await this.getUserProfile(userId, db);
                const oldLevel = profile.level;
                profile.xp += amount;
                const newLevel = this.calculateLevel(profile.xp);
                
                if (newLevel > oldLevel) {
                    profile.level = newLevel;
                    profile.money += this.config.levelUpReward;
                    profile.stats.maxHp += 20;
                    profile.stats.hp = profile.stats.maxHp;
                    profile.stats.damage += 2;
                    
                    await m.reply(`🎉 *¡SUBISTE DE NIVEL!*

                    📊 Nivel ${oldLevel} → ${newLevel}
                    💰 +${this.config.levelUpReward} monedas
                    ❤️ +20 HP Máximo
                    ⚔️ +2 Daño`);
                }
                
                await db.update();
                return { oldLevel, newLevel, levelUp: newLevel > oldLevel };
            },
            
            async buyItem(userId, itemId, db) {
                const profile = await this.getUserProfile(userId, db);
                const item = this.items[itemId];
                
                if (!item) return { success: false, error: 'Item no existe' };
                if (profile.money < item.price) return { success: false, error: 'Dinero insuficiente' };
                
                profile.money -= item.price;
                profile.inventory.push({ id: itemId, ...item, quantity: item.type === 'consumable' ? 1 : undefined });
                await db.update();
                
                return { success: true, item, remaining: profile.money };
            },
            
            async equipItem(userId, itemId, db) {
                const profile = await this.getUserProfile(userId, db);
                const itemInInventory = profile.inventory.find(i => i.id === itemId);
                
                if (!itemInInventory) return { success: false, error: 'No tienes ese item' };
                
                if (itemInInventory.type === 'weapon') {
                    if (profile.equipped.weapon) {
                        profile.stats.damage -= this.items[profile.equipped.weapon].damage;
                    }
                    profile.equipped.weapon = itemId;
                    profile.stats.damage += itemInInventory.damage;
                } else if (itemInInventory.type === 'armor') {
                    if (profile.equipped.armor) {
                        profile.stats.defense -= this.items[profile.equipped.armor].defense;
                    }
                    profile.equipped.armor = itemId;
                    profile.stats.defense += itemInInventory.defense;
                }
                
                await db.update();
                return { success: true };
            }
        }
    }
}

plugin.script = async (m, { plugin: pluginManager, sock }) => {
    // Auto-actualizar perfil cuando alguien envía mensaje
    const economy = pluginManager.import('@economy');
    const db = await sock.plugins['@Objects'].store.open('rpg:economy');
    
    // Crear perfil si no existe
    await economy.getUserProfile(m.sender.id, db);
    
    // XP por participación (pequeña cantidad)
    if (!m.sender.roles.bot && m.content.text.length > 10) {
        const xpGain = Math.floor(Math.random() * 3) + 1;
        await economy.addXP(m.sender.id, xpGain, db, m);
    }
}

export default plugin;
```

### 3. Before Plugin - Auto-Respuestas Inteligentes

Sistema de respuestas automáticas con contexto y aprendizaje:

```javascript
// plugins/@auto-response.before.plugin.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const plugin = {
    before: true,
    index: 3,
    export: {
        '@ai-responder': {
            conversationHistory: new Map(),
            learningDatabase: new Map(),
            
            getHistory(chatId) {
                if (!this.conversationHistory.has(chatId)) {
                    this.conversationHistory.set(chatId, []);
                }
                return this.conversationHistory.get(chatId).slice(-10);
            },
            
            addToHistory(chatId, role, content) {
                const history = this.conversationHistory.get(chatId) || [];
                history.push({ role, content, timestamp: Date.now() });
                
                if (history.length > 20) history.shift();
                this.conversationHistory.set(chatId, history);
            },
            
            async generateResponse(message, context, history) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                
                const systemPrompt = `Eres un asistente virtual amigable en WhatsApp. 
Contexto del grupo: ${context.isGroup ? 'Grupo "' + context.chatName + '"' : 'Chat privado'}
Usuario: ${context.userName}

Historial reciente:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

Responde de manera natural, concisa (máximo 3 líneas) y útil.`;
                
                const chat = model.startChat({
                    history: [{ role: "user", parts: [{ text: systemPrompt }] }],
                    generationConfig: { maxOutputTokens: 200 }
                });
                
                const result = await chat.sendMessage(message);
                return result.response.text();
            }
        }
    }
}

plugin.script = async (m, { sock, plugin: pluginManager, control }) => {
    // Solo responder cuando mencionan al bot (ya lo maneja @asistente.before.plugin.js)
    if (m.isCmd || !m.sender.mentioned?.includes(m.bot.id)) return;
    
    const aiResponder = pluginManager.import('@ai-responder');
    const db = await sock.plugins['@Objects'].store.open('ai:settings');
    
    // Configuración por chat
    if (!db.data.chats) db.data.chats = {};
    if (!db.data.chats[m.chat.id]) {
        db.data.chats[m.chat.id] = {
            enabled: true,
            mode: 'smart', // smart, simple, off
            personality: 'amigable'
        };
    }
    
    const settings = db.data.chats[m.chat.id];
    if (!settings.enabled || settings.mode === 'off') return;
    
    try {
        await m.react('wait');
        
        const history = aiResponder.getHistory(m.chat.id);
        const context = {
            isGroup: m.chat.isGroup,
            chatName: m.chat.name || 'Chat Privado',
            userName: m.sender.name,
            userLevel: m.sender.roles.owner ? 'Propietario' : 
                       m.sender.roles.prem ? 'Premium' : 'Usuario'
        };
        
        // Generar respuesta
        const response = await aiResponder.generateResponse(m.text, context, history);
        
        // Guardar en historial
        aiResponder.addToHistory(m.chat.id, 'user', m.text);
        aiResponder.addToHistory(m.chat.id, 'assistant', response);
        
        await m.reply(response);
        await m.react('done');
        
        await db.update();
        
    } catch (error) {
        console.error('Error en AI Responder:', error);
        await m.react('error');
        await m.reply('Lo siento, hubo un error al procesar tu solicitud.');
    }
}

export default plugin;
```

### 4. StubType Plugin - Gestor Avanzado de Eventos

Maneja múltiples eventos de grupo con estadísticas y logs:

```javascript
// plugins/@group-events.stubtype.plugin.js

const plugin = {
    stubtype: true,
    case: [
        'GROUP_PARTICIPANT_ADD',
        'GROUP_PARTICIPANT_REMOVE',
        'GROUP_PARTICIPANT_PROMOTE',
        'GROUP_PARTICIPANT_DEMOTE',
        'GROUP_CHANGE_SUBJECT',
        'GROUP_CHANGE_DESCRIPTION',
        'GROUP_CHANGE_ANNOUNCE'
    ],
    export: {
        '@event-logger': {
            eventTypes: {
                'GROUP_PARTICIPANT_ADD': '➕ Miembro Agregado',
                'GROUP_PARTICIPANT_REMOVE': '➖ Miembro Removido',
                'GROUP_PARTICIPANT_PROMOTE': '⬆️ Promovido a Admin',
                'GROUP_PARTICIPANT_DEMOTE': '⬇️ Degradado de Admin',
                'GROUP_CHANGE_SUBJECT': '📝 Nombre Cambiado',
                'GROUP_CHANGE_DESCRIPTION': '📄 Descripción Cambiada',
                'GROUP_CHANGE_ANNOUNCE': '📢 Configuración Cambiada'
            },
            
            async logEvent(eventType, chatId, data, db) {
                if (!db.data.events) db.data.events = {};
                if (!db.data.events[chatId]) db.data.events[chatId] = [];
                
                db.data.events[chatId].push({
                    type: eventType,
                    timestamp: Date.now(),
                    data: data
                });
                
                // Mantener solo últimos 100 eventos por grupo
                if (db.data.events[chatId].length > 100) {
                    db.data.events[chatId].shift();
                }
                
                await db.update();
            },
            
            async getStatistics(chatId, db) {
                const events = db.data.events?.[chatId] || [];
                const stats = {
                    total: events.length,
                    byType: {},
                    recentActivity: events.slice(-10),
                    mostActiveDay: null
                };
                
                events.forEach(e => {
                    stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
                });
                
                return stats;
            }
        }
    }
}

plugin.script = async (m, { sock, plugin: pluginManager, parameters, even }) => {
    const eventLogger = pluginManager.import('@event-logger');
    const db = await sock.plugins['@Objects'].store.open('events:groups');
    
    if (!db.data.settings) db.data.settings = {};
    if (!db.data.settings[m.chat.id]) {
        db.data.settings[m.chat.id] = {
            welcomeEnabled: true,
            goodbyeEnabled: true,
            logEnabled: true,
            antiLink: false
        };
    }
    
    const settings = db.data.settings[m.chat.id];
    const eventName = eventLogger.eventTypes[even] || even;
    
    // Log del evento
    if (settings.logEnabled) {
        await eventLogger.logEvent(even, m.chat.id, {
            parameters,
            executor: m.sender.id,
            timestamp: Date.now()
        }, db);
    }
    
    switch (even) {
        case 'GROUP_PARTICIPANT_ADD': {
            if (!settings.welcomeEnabled) break;
            
            const newMembers = parameters;
            const welcomeText = `
╭─────────────────
│ 👋 *¡Bienvenid${newMembers.length > 1 ? 'os' : 'o'}!*
├─────────────────
│ ${newMembers.map(m => `@${m.split('@')[0]}`).join('\n│ ')}
├─────────────────
│ 📊 Miembros: ${await sock.groupMetadata(m.chat.id).then(g => g.participants.length)}
│ 📜 Lee las reglas del grupo
│ 🎉 ¡Disfruta tu estadía!
╰─────────────────`;
            
            await sock.sendMessage(m.chat.id, {
                text: welcomeText,
                contextInfo: { mentionedJid: newMembers }
            });
            
            // Obtener perfil de economía
            const economy = pluginManager.import('@economy');
            if (economy) {
                const econDb = await sock.plugins['@Objects'].store.open('rpg:economy');
                for (const member of newMembers) {
                    await economy.getUserProfile(member, econDb);
                    await economy.addMoney(member, 100, econDb); // Bono de bienvenida
                }
            }
            break;
        }
        
        case 'GROUP_PARTICIPANT_REMOVE': {
            if (!settings.goodbyeEnabled) break;
            
            const removedMembers = parameters;
            const goodbyeText = `👋 *Adiós*\n\n${removedMembers.map(m => `@${m.split('@')[0]}`).join(', ')} ha salido del grupo.`;
            
            await sock.sendMessage(m.chat.id, {
                text: goodbyeText,
                contextInfo: { mentionedJid: removedMembers }
            });
            break;
        }
        
        case 'GROUP_PARTICIPANT_PROMOTE': {
            const promoted = parameters;
            await sock.sendMessage(m.chat.id, {
                text: `⬆️ *Promoción*\n\n@${promoted[0].split('@')[0]} ahora es administrador.`,
                contextInfo: { mentionedJid: promoted }
            });
            break;
        }
        
        case 'GROUP_PARTICIPANT_DEMOTE': {
            const demoted = parameters;
            await sock.sendMessage(m.chat.id, {
                text: `⬇️ *Degradación*\n\n@${demoted[0].split('@')[0]} ya no es administrador.`,
                contextInfo: { mentionedJid: demoted }
            });
            break;
        }
        
        case 'GROUP_CHANGE_SUBJECT': {
            const newName = parameters[0];
            await m.reply(`📝 *Nombre del grupo actualizado*\n\nNuevo nombre: ${newName}`);
            break;
        }
        
        case 'GROUP_CHANGE_DESCRIPTION': {
            await m.reply(`📄 *Descripción del grupo actualizada*`);
            break;
        }
    }
    
    await db.update();
}

export default plugin;
```

### 5. Command Plugin - Comando RPG Completo

Sistema de batalla y aventuras usando los exports de economía:

```javascript
// plugins/@rpg-adventure.cmd.plugin.js

const plugin = {
    case: ['aventura', 'battle', 'luchar'],
    usage: ['.aventura', '.battle [enemigo]', '.luchar'],
    category: ['rpg'],
    command: true,
    usePrefix: true
}

plugin.script = async (m, { sock, plugin: pluginManager }) => {
    const economy = pluginManager.import('@economy');
    if (!economy) {
        return await m.reply('❌ Sistema de economía no disponible');
    }
    
    const db = await sock.plugins['@Objects'].store.open('rpg:economy');
    const profile = await economy.getUserProfile(m.sender.id, db);
    
    // Sistema de enemigos
    const enemies = {
        slime: { name: '🟢 Slime', hp: 30, damage: 5, reward: 50, xp: 20 },
        goblin: { name: '👺 Goblin', hp: 60, damage: 12, reward: 120, xp: 50 },
        dragon: { name: '🐉 Dragón', hp: 200, damage: 30, reward: 1000, xp: 300, minLevel: 10 },
        boss: { name: '😈 Jefe Final', hp: 500, damage: 50, reward: 5000, xp: 1000, minLevel: 20 }
    };
    
    // Seleccionar enemigo basado en nivel o argumento
    let enemyKey = m.args[0]?.toLowerCase();
    if (!enemyKey || !enemies[enemyKey]) {
        // Enemigo aleatorio según nivel
        const availableEnemies = Object.keys(enemies).filter(key => {
            const enemy = enemies[key];
            return !enemy.minLevel || profile.level >= enemy.minLevel;
        });
        enemyKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }
    
    const enemy = { ...enemies[enemyKey], currentHp: enemies[enemyKey].hp };
    
    // Verificar nivel mínimo
    if (enemy.minLevel && profile.level < enemy.minLevel) {
        return await m.reply(`❌ Necesitas nivel ${enemy.minLevel} para enfrentar a ${enemy.name}`);
    }
    
    // Sistema de batalla
    await m.reply(`⚔️ *BATALLA INICIADA*

🎮 **${m.sender.name}** vs ${enemy.name}

╭──── *TUS STATS* ────
│ ❤️ HP: ${profile.stats.hp}/${profile.stats.maxHp}
│ ⚔️ Daño: ${profile.stats.damage}
│ 🛡️ Defensa: ${profile.stats.defense}
╰────────────────

⚡ Usa sock.setReplyHandler para continuar!`);
    
    // Configurar handler de respuestas para la batalla
    await sock.setReplyHandler(m.message, {
        security: {
            userId: m.sender.id,
            chatId: m.chat.id,
            scope: 'all'
        },
        lifecycle: {
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
            consumeOnce: false
        },
        routes: [{
            priority: 1,
            code: {
                guard: (reply) => {
                    const validActions = ['atacar', 'defender', 'huir', 'pocion'];
                    return validActions.includes(reply.text.toLowerCase());
                },
                executor: async (reply, { state, sock }) => {
                    const action = reply.text.toLowerCase();
                    const playerStats = state.playerStats;
                    const enemyState = state.enemyState;
                    
                    let battleLog = '';
                    let playerDamage = 0;
                    let enemyDamage = 0;
                    
                    // Turno del jugador
                    switch (action) {
                        case 'atacar':
                            playerDamage = Math.floor(Math.random() * playerStats.damage) + playerStats.damage;
                            const critical = Math.random() < 0.15;
                            if (critical) {
                                playerDamage *= 2;
                                battleLog += '💥 ¡CRÍTICO! ';
                            }
                            enemyState.currentHp -= playerDamage;
                            battleLog += `⚔️ Le hiciste ${playerDamage} de daño\n`;
                            break;
                            
                        case 'defender':
                            state.defending = true;
                            battleLog += '🛡️ Te preparas para defender\n';
                            break;
                            
                        case 'huir':
                            const escapeChance = Math.random();
                            if (escapeChance > 0.5) {
                                await sock.sendMessage(reply.chat.id, {
                                    text: '🏃 ¡Lograste escapar!'
                                }, { quoted: reply.message });
                                return { end: true };
                            } else {
                                battleLog += '❌ ¡No pudiste escapar!\n';
                            }
                            break;
                            
                        case 'pocion':
                            const hasPotion = playerStats.inventory.some(i => i.id === 'pocion_vida');
                            if (hasPotion) {
                                const healAmount = 50;
                                playerStats.hp = Math.min(playerStats.hp + healAmount, playerStats.maxHp);
                                battleLog += `🧪 Recuperaste ${healAmount} HP\n`;
                                // Remover poción del inventario
                                const idx = playerStats.inventory.findIndex(i => i.id === 'pocion_vida');
                                if (idx !== -1) playerStats.inventory.splice(idx, 1);
                            } else {
                                battleLog += '❌ No tienes pociones\n';
                            }
                            break;
                    }
                    
                    // Verificar si el enemigo murió
                    if (enemyState.currentHp <= 0) {
                        const victoryMsg = `
🎉 *¡VICTORIA!* 

╭──── *RECOMPENSAS* ────
│ 💰 +${enemyState.reward} monedas
│ ⭐ +${enemyState.xp} XP
│ 📊 Nivel: ${playerStats.level}
╰─────────────────

${battleLog}`;
                        
                        // Actualizar base de datos
                        const db = await store.open('rpg:economy');
                        await economy.addMoney(reply.sender.id, enemyState.reward, db);
                        await economy.addXP(reply.sender.id, enemyState.xp, db, reply);
                        
                        await sock.sendMessage(reply.chat.id, {
                            text: victoryMsg
                        }, { quoted: reply.message });
                        
                        return { end: true };
                    }
                    
                    // Turno del enemigo
                    enemyDamage = Math.floor(Math.random() * enemyState.damage) + 5;
                    if (state.defending) {
                        enemyDamage = Math.floor(enemyDamage * 0.5);
                        state.defending = false;
                    }
                    enemyDamage = Math.max(0, enemyDamage - playerStats.defense);
                    playerStats.hp -= enemyDamage;
                    battleLog += `💔 ${enemyState.name} te hizo ${enemyDamage} de daño\n`;
                    
                    // Verificar si el jugador murió
                    if (playerStats.hp <= 0) {
                        const defeatMsg = `
☠️ *HAS SIDO DERROTADO*

${enemyState.name} te ha vencido.
Perdiste 50 monedas.

${battleLog}`;
                        
                        const db = await store.open('rpg:economy');
                        await economy.addMoney(reply.sender.id, -50, db);
                        playerStats.hp = playerStats.maxHp; // Revivir
                        await db.update();
                        
                        await sock.sendMessage(reply.chat.id, {
                            text: defeatMsg
                        }, { quoted: reply.message });
                        
                        return { end: true };
                    }
                    
                    // Continuar batalla
                    const statusMsg = `
⚔️ *BATALLA EN CURSO*

${battleLog}

╭──── *TU ESTADO* ────
│ ❤️ HP: ${playerStats.hp}/${playerStats.maxHp}
╰───────────────

╭──── *${enemyState.name}* ────
│ ❤️ HP: ${enemyState.currentHp}/${enemyState.hp}
╰───────────────

*Acciones:*
• atacar - Ataque normal
• defender - Reduce daño recibido
• pocion - Usar poción (+50 HP)
• huir - Intentar escapar`;
                    
                    await sock.sendMessage(reply.chat.id, {
                        text: statusMsg
                    }, { quoted: reply.message });
                    
                    // Actualizar estado
                    return {
                        state: {
                            playerStats,
                            enemyState,
                            defending: state.defending
                        }
                    };
                }
            }
        }],
        state: {
            playerStats: profile.stats,
            enemyState: enemy,
            defending: false
        }
    }, 5 * 60 * 1000);
    
    await db.update();
}

export default plugin;
```

### 6. Command Plugin - Panel de Administración IA

Sistema completo de administración con IA y estadísticas:

```javascript
// plugins/@admin-panel.cmd.plugin.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const plugin = {
    case: ['panel', 'admin', 'dashboard'],
    usage: ['.panel', '.admin [accion]'],
    category: ['admin'],
    command: true,
    usePrefix: true
}

plugin.script = async (m, { sock, plugin: pluginManager }) => {
    // Verificar permisos
    if (!m.sender.roles.owner && !m.sender.roles.modr) {
        return m.sms('owner');
    }
    
    const action = m.args[0]?.toLowerCase();
    
    if (!action) {
        // Dashboard principal
        const db = await sock.plugins['@Objects'].store.open('system:BUC');
        const spamDb = await sock.plugins['@Objects'].store.open('anti-spam:users');
        const economyDb = await sock.plugins['@Objects'].store.open('rpg:economy');
        const eventsDb = await sock.plugins['@Objects'].store.open('events:groups');
        
        const totalUsers = Object.keys(db.data['@users'] || {}).length;
        const totalChats = Object.keys(db.data['@chats'] || {}).length;
        const bannedUsers = Object.keys(spamDb.data.banned || {}).length;
        const economyUsers = Object.keys(economyDb.data.users || {}).length;
        
        // Estadísticas de uso de plugins
        const allPlugins = await sock.plugins.get({});
        const commandPlugins = allPlugins.filter(p => p.command).length;
        const beforePlugins = allPlugins.filter(p => p.before).length;
        const stubtypePlugins = allPlugins.filter(p => p.stubtype).length;
        
        const dashboard = `
╔══════════════════════
║ 🎛️ *PANEL DE ADMINISTRACIÓN*
╠══════════════════════
║
║ 📊 *ESTADÍSTICAS GENERALES*
║ ├ 👥 Usuarios: ${totalUsers}
║ ├ 💬 Chats: ${totalChats}
║ ├ 🚫 Baneados: ${bannedUsers}
║ └ 💰 Economía Activa: ${economyUsers}
║
║ 🔌 *PLUGINS CARGADOS*
║ ├ ⌨️ Comandos: ${commandPlugins}
║ ├ ⚡ Before: ${beforePlugins}
║ └ 📡 StubType: ${stubtypePlugins}
║
║ 🤖 *ESTADO DEL BOT*
║ ├ 📱 Nombre: ${m.bot.name}
║ ├ 🔢 Número: ${m.bot.number}
║ └ ⏱️ Uptime: ${process.uptime().toFixed(0)}s
║
╠══════════════════════
║ *COMANDOS DISPONIBLES*
║ • .panel stats - Estadísticas detalladas
║ • .panel users - Gestión de usuarios
║ • .panel bans - Gestión de baneos
║ • .panel ai - Análisis IA
║ • .panel clean - Limpiar datos
╚══════════════════════`;
        
        return await m.reply(dashboard);
    }
    
    // Acciones específicas
    switch (action) {
        case 'stats': {
            const eventLogger = pluginManager.import('@event-logger');
            const eventsDb = await sock.plugins['@Objects'].store.open('events:groups');
            
            if (m.chat.isGroup && eventLogger) {
                const stats = await eventLogger.getStatistics(m.chat.id, eventsDb);
                
                let statsMsg = `📊 *ESTADÍSTICAS DEL GRUPO*\n\n`;
                statsMsg += `📈 Total de eventos: ${stats.total}\n\n`;
                statsMsg += `*Por tipo:*\n`;
                
                for (const [type, count] of Object.entries(stats.byType)) {
                    const emoji = eventLogger.eventTypes[type]?.split(' ')[0] || '•';
                    statsMsg += `${emoji} ${type}: ${count}\n`;
                }
                
                statsMsg += `\n*Actividad reciente:*\n`;
                stats.recentActivity.slice(-5).forEach(e => {
                    const date = new Date(e.timestamp);
                    statsMsg += `• ${date.toLocaleDateString()} - ${eventLogger.eventTypes[e.type]}\n`;
                });
                
                return await m.reply(statsMsg);
            }
            
            return await m.reply('❌ Solo disponible en grupos');
        }
        
        case 'users': {
            const db = await sock.plugins['@Objects'].store.open('system:BUC');
            const users = db.data['@users'] || {};
            
            const ownerCount = Object.values(users).filter(u => u.roles.owner).length;
            const premCount = Object.values(users).filter(u => u.roles.prem).length;
            const bannedCount = Object.values(users).filter(u => u.banned).length;
            
            const usersMsg = `
👥 *GESTIÓN DE USUARIOS*

📊 *Resumen:*
├ 👤 Total: ${Object.keys(users).length}
├ 👑 Owners: ${ownerCount}
├ ⭐ Premium: ${premCount}
└ 🚫 Baneados: ${bannedCount}

*Comandos:*
• .panel ban @user - Banear usuario
• .panel unban @user - Desbanear
• .panel prem @user - Dar premium
• .panel delprem @user - Quitar premium`;
            
            return await m.reply(usersMsg);
        }
        
        case 'ban': {
            if (!m.sender.mentioned || m.sender.mentioned.length === 0) {
                return await m.reply('❌ Menciona a un usuario para banear');
            }
            
            const userToBan = m.sender.mentioned[0];
            const db = await sock.plugins['@Objects'].store.open('system:BUC');
            
            if (!db.data['@users'][userToBan]) {
                db.data['@users'][userToBan] = { banned: false, roles: {} };
            }
            
            db.data['@users'][userToBan].banned = true;
            await db.update();
            
            return await m.reply(`🚫 Usuario @${userToBan.split('@')[0]} ha sido baneado`);
        }
        
        case 'ai': {
            // Análisis IA del grupo
            await m.react('wait');
            
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const eventsDb = await sock.plugins['@Objects'].store.open('events:groups');
            const economyDb = await sock.plugins['@Objects'].store.open('rpg:economy');
            const spamDb = await sock.plugins['@Objects'].store.open('anti-spam:users');
            
            const prompt = `Analiza estos datos del bot y genera un reporte ejecutivo:

Usuarios totales: ${Object.keys((await sock.plugins['@Objects'].store.open('system:BUC')).data['@users'] || {}).length}
Baneados por spam: ${Object.keys(spamDb.data.banned || {}).length}
Usuarios con economía activa: ${Object.keys(economyDb.data.users || {}).length}

Genera un reporte en español con:
1. Resumen ejecutivo (2-3 líneas)
2. Puntos clave (3-4 bullets)
3. Recomendaciones (2-3 acciones)

Formato markdown, máximo 15 líneas.`;
            
            try {
                const result = await model.generateContent(prompt);
                const analysis = result.response.text();
                
                await m.reply(`🤖 *ANÁLISIS IA DEL SISTEMA*\n\n${analysis}`);
                await m.react('done');
            } catch (error) {
                await m.react('error');
                await m.reply('❌ Error en análisis IA');
            }
            break;
        }
        
        case 'clean': {
            // Limpiar datos antiguos
            const spamDb = await sock.plugins['@Objects'].store.open('anti-spam:users');
            const eventsDb = await sock.plugins['@Objects'].store.open('events:groups');
            
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            // Limpiar baneos antiguos
            let cleaned = 0;
            for (const [userId, banInfo] of Object.entries(spamDb.data.banned || {})) {
                if (banInfo.timestamp < thirtyDaysAgo) {
                    delete spamDb.data.banned[userId];
                    cleaned++;
                }
            }
            
            await spamDb.update();
            
            return await m.reply(`🧹 *LIMPIEZA COMPLETADA*\n\n✅ Se limpiaron ${cleaned} registros antiguos`);
        }
        
        default:
            return await m.reply('❌ Acción no válida. Usa .panel para ver opciones.');
    }
}

export default plugin;
```

---

## 🔄 Plugins Conviviendo - Ecosistema Completo

Los ejemplos anteriores están diseñados para trabajar juntos:

### Flujo de Ejecución Completo

```
1. Mensaje recibido
   ↓
2. @anti-spam.before (index: 1)
   - Detecta flooding
   - Analiza con IA
   - Puede detener ejecución (control.end = true)
   ↓
3. @economy-rpg.before (index: 2)
   - Crea perfil si no existe
   - Otorga XP por participación
   ↓
4. Si es evento de grupo → @group-events.stubtype
   - Bienvenidas/despedidas
   - Logs de eventos
   - Bonos de economía
   ↓
5. @auto-response.before (index: 3)
   - Responde con IA si mencionan al bot
   ↓
6. Si es comando → Ejecuta plugin
   - .aventura → @rpg-adventure.cmd
   - .panel → @admin-panel.cmd
   - .jun → @asistente.cmd
```

### Interacciones entre Plugins

```javascript
// El plugin de RPG usa exports de economía
const economy = plugin.import('@economy');
await economy.addMoney(userId, 100, db);

// El plugin de eventos usa economía para bonos
if (economy) {
    await economy.addMoney(newMember, 100, econDb);
}

// El panel de admin analiza datos de todos los plugins
const spamDb = await sock.plugins['@Objects'].store.open('anti-spam:users');
const economyDb = await sock.plugins['@Objects'].store.open('rpg:economy');
```

---

## 📚 Base de Datos

SimpleBase incluye un sistema de base de datos JSON persistente:

```javascript
// Abrir/crear base de datos
const db = await $base.open('mi-database');

// Leer datos
console.log(db.data);

// Modificar datos
db.data.usuarios = {};
db.data.usuarios['123'] = { nombre: 'Juan' };

// Guardar cambios
await db.update();

// Verificar existencia
if (await $base.has('mi-database')) {
    console.log('La base existe');
}

// Eliminar base
await $base.delete('mi-database');
```

---

## 🛠️ Utilidades de Sock

```javascript
// Obtener buffer desde URL/archivo/base64
const buffer = await sock.getFrom('https://example.com/image.jpg', 'buffer');
const stream = await sock.getFrom('https://example.com/image.jpg', 'stream');
const base64 = await sock.getFrom('./image.jpg', 'base64');

// Obtener JSON desde URL
const data = await sock.getJSON('https://api.example.com/data');

// Redimensionar imagen
const resized = await sock.resizePhoto({
    image: buffer,
    scale: 720,
    result: 'buffer' // o 'base64'
});

// Descargar media de un mensaje
const media = await sock.downloadMedia(message);

// Subir archivo temporal
const url = await sock.uploadFiloTmp(buffer);
```

---

## 🎨 Configuración Global

```javascript
// ./config.js
export default {
    owner: ['1234567890'],           // Números de propietarios
    prefix: '.',                     // Prefijo de comandos
    botName: 'SimpleBase Bot',      // Nombre del bot
    mainBotPrefix: true,            // ¿Usar prefijo?
    'mainBotAuto-read': true,       // Auto-leer mensajes
    SetUserRoles: {
        '1234567890': {
            rowner: true,
            owner: true,
            modr: true,
            prem: true
        }
    }
}
```

---

## 📝 Variables de Entorno

```bash
# .env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
```

---

## 🚀 Scripts NPM

```bash
npm start       # Inicia el bot
npm run build   # Instala e inicia
```

---

## 📖 Recursos Adicionales

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [Google Generative AI](https://ai.google.dev/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 💬 Soporte

Para soporte y preguntas:
- **Autor**: Zeppth
- **Issues**: [GitHub Issues](https://github.com/tuusuario/simple-base/issues)

---

**Hecho con ❤️ usando Baileys y Google AI**
