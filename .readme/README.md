# SimpleBase

Bot framework para WhatsApp basado en Baileys con sistema de plugins modular.

## Instalación

```bash
npm install
npm start
```

Configura el archivo `.env` con tus credenciales antes de iniciar.

## Estructura

El framework se organiza en tres capas:

**Objetos m**: Representan mensajes procesados con propiedades normalizadas.

- `m.id` - ID único del mensaje
- `m.message` - Mensaje completo de Baileys
- `m.content` - Contenido parseado (texto, medios)
- `m.type` - Tipo de mensaje
- `m.sender` - Datos del remitente
- `m.chat` - Datos del chat
- `m.quoted` - Mensaje citado si existe
- `m.reply(text)` - Responder al mensaje
- `m.react(emoji)` - Reaccionar al mensaje

**sock**: Cliente de WhatsApp extendido con métodos personalizados.

- `sock.getFrom(source, type)` - Obtener buffer/stream/base64 desde URL, archivo o Buffer
- `sock.getJSON(url)` - Peticiones HTTP JSON
- `sock.downloadMedia(message)` - Descargar medios de mensajes
- `sock.setReplyHandler(message, options)` - Crear handlers interactivos con rutas
- `sock.plugins` - Gestor de plugins
- `sock.sendMessage()` - Métodos nativos de Baileys

**plugin**: Sistema de importación/exportación entre plugins.

- `plugin.import(name)` - Importar exports de otros plugins
- `plugin.export(name, object)` - Exportar objetos para otros plugins

## Sistema de Plugins

Los plugins se cargan automáticamente desde `./plugins` con nomenclatura específica.

### Plugin Before

Procesa mensajes antes del comando principal. Se ejecutan en orden por `index`.

**Nombre**: `@nombre.before.plugin.js`

**Propiedades**:
- `before: true` - Marca como plugin before
- `index: number` - Orden de ejecución (1, 2, 3)
- `script: async (m, ctx) => {}` - Función ejecutada

**Contexto**:
- `ctx.sock` - Cliente de WhatsApp
- `ctx.plugin` - Gestor de plugins
- `ctx.store` - Store de Baileys
- `ctx.control.end` - Detener ejecución (`control.end = true`)

### Plugin StubType

Captura eventos nativos de WhatsApp (cambios de grupo, llamadas, etc).

**Nombre**: `@nombre.stubtype.plugin.js`

**Propiedades**:
- `stubtype: true` - Marca como plugin stubtype
- `case: string | array` - Nombres de eventos a capturar
- `script: async (m, ctx) => {}` - Función ejecutada

**Contexto**:
- `ctx.sock` - Cliente
- `ctx.plugin` - Gestor de plugins
- `ctx.store` - Store
- `ctx.even` - Nombre del evento
- `ctx.parameters` - Parámetros del stub

**Eventos comunes**: `GROUP_PARTICIPANT_ADD`, `GROUP_PARTICIPANT_REMOVE`, `GROUP_CHANGE_SUBJECT`, `GROUP_CHANGE_DESCRIPTION`.

### Plugin Export

Exporta objetos/funciones para uso en otros plugins.

**Nombre**: `@nombre.export.plugin.js`

**Propiedades**:
- `export: { key: value }` - Objeto a exportar

Los exports se importan con `plugin.import('key')` desde cualquier plugin.

### Plugin Command

Ejecuta comandos basados en prefijos.

**Nombre**: `@nombre.cmd.plugin.js`

**Propiedades**:
- `command: true` - Marca como comando
- `cmd: string | array` - Comando(s) sin prefijo
- `script: async (m, ctx) => {}` - Función ejecutada

**Contexto**:
- `ctx.sock` - Cliente
- `ctx.plugin` - Gestor de plugins
- `ctx.store` - Store

El sistema parsea automáticamente el prefijo configurado.

## Ejemplos Avanzados

Los plugins actuales del proyecto funcionan como referencia privada. Los siguientes ejemplos demuestran el uso de funciones nativas del sistema y armonía entre plugins.

### Before: Event Logger (Armonía con Commands)

Registra todos los eventos de mensajes en la base de datos global.

```js
// @eventlog.before.plugin.js
export default {
    before: true,
    index: 1,
    script: async (m, { sock }) => {
        const db = await global.db.open('system:EventHistory');
        
        if (!db.data.messages) db.data.messages = [];
        
        db.data.messages.push({
            id: m.id,
            from: m.sender.id,
            fromName: m.sender.name,
            chat: m.chat.id,
            chatName: m.chat.name || 'Privado',
            isGroup: m.chat.isGroup,
            text: m.content.text,
            type: m.type,
            timestamp: Date.now(),
            roles: m.sender.roles
        });
        
        // Mantener últimos 1000 eventos
        if (db.data.messages.length > 1000) {
            db.data.messages = db.data.messages.slice(-1000);
        }
        
        await db.update();
    }
}
```

### Before: Rate Limiter con Variables Globales

Usa `global.settings` para configuración dinámica.

```js
// @ratelimit.before.plugin.js
export default {
    before: true,
    index: 2,
    script: async (m, { control }) => {
        // Usuarios con roles especiales no tienen límite
        if (await m.sender.role('rowner', 'owner', 'modr')) return;
        
        const db = await global.db.open('system:RateLimit');
        const key = m.sender.id;
        
        if (!db.data[key]) db.data[key] = { count: 0, resetAt: Date.now() + 60000 };
        
        const limit = db.data[key];
        
        if (Date.now() > limit.resetAt) {
            db.data[key] = { count: 1, resetAt: Date.now() + 60000 };
            await db.update();
            return;
        }
        
        if (limit.count >= 15) {
            await m.reply(`⚠️ Límite alcanzado. Espera ${Math.ceil((limit.resetAt - Date.now()) / 1000)}s`);
            await m.react(global.settings.reactEmojis?.failure || '✖️');
            control.end = true;
            return;
        }
        
        db.data[key].count++;
        await db.update();
    }
}
```

### Before: User Analytics Tracker

Trackea actividad de usuarios usando funciones nativas del objeto `m`.

```js
// @analytics.before.plugin.js
export default {
    before: true,
    index: 3,
    script: async (m, { sock }) => {
        const db = await global.db.open('system:Analytics');
        
        if (!db.data.users) db.data.users = {};
        
        const userId = m.sender.id;
        
        if (!db.data.users[userId]) {
            db.data.users[userId] = {
                name: m.sender.name,
                number: m.sender.number,
                firstSeen: Date.now(),
                messageCount: 0,
                commandCount: 0,
                groupChats: [],
                privateChats: 0,
                mediaCount: 0
            };
        }
        
        const user = db.data.users[userId];
        user.messageCount++;
        user.name = m.sender.name;
        
        if (m.chat.isGroup && !user.groupChats.includes(m.chat.id)) {
            user.groupChats.push(m.chat.id);
        } else if (!m.chat.isGroup) {
            user.privateChats++;
        }
        
        if (m.content.media) user.mediaCount++;
        
        // Se incrementará en parser si es comando
        user.lastSeen = Date.now();
        
        await db.update();
    }
}
```

### StubType: Group Event Logger (Armonía con Commands)

Registra eventos de grupo para consulta posterior.

```js
// @groupevents.stubtype.plugin.js
export default {
    stubtype: true,
    case: ['GROUP_PARTICIPANT_ADD', 'GROUP_PARTICIPANT_REMOVE', 'GROUP_CHANGE_SUBJECT', 'GROUP_CHANGE_DESCRIPTION'],
    script: async (m, { even, parameters, sock }) => {
        const db = await global.db.open('system:GroupEvents');
        
        if (!db.data[m.chat.id]) db.data[m.chat.id] = [];
        
        const eventData = {
            type: even,
            timestamp: Date.now(),
            chatName: m.chat.name,
            parameters: parameters,
            triggeredBy: m.sender.id
        };
        
        db.data[m.chat.id].push(eventData);
        
        // Mantener últimos 100 eventos por grupo
        if (db.data[m.chat.id].length > 100) {
            db.data[m.chat.id] = db.data[m.chat.id].slice(-100);
        }
        
        await db.update();
        
        // Notificación según tipo
        if (even === 'GROUP_PARTICIPANT_ADD') {
            const [newUser] = parameters;
            await sock.sendMessage(m.chat.id, {
                text: `🎉 Bienvenido @${newUser.split('@')[0]}!\n\n` +
                      `Grupo: *${m.chat.name}*\n` +
                      `Miembros: ${m.chat.size || 'N/A'}`,
                mentions: [newUser]
            });
        }
    }
}
```

### StubType: Auto Backup on Changes

Backup automático al detectar cambios importantes usando `sock.getFrom()`.

```js
// @autobackup.stubtype.plugin.js
export default {
    stubtype: true,
    case: ['GROUP_CHANGE_ICON', 'GROUP_CHANGE_SUBJECT'],
    script: async (m, { even, parameters, sock }) => {
        const db = await global.db.open(`backup:${m.chat.id}`);
        
        if (!db.data.history) db.data.history = [];
        
        if (even === 'GROUP_CHANGE_ICON') {
            // Descargar foto del grupo
            const groupPhoto = await sock.profilePictureUrl(m.chat.id, 'image')
                .catch(() => null);
            
            if (groupPhoto) {
                const photoBuffer = await sock.getFrom(groupPhoto, 'base64');
                db.data.history.push({
                    type: 'icon_change',
                    timestamp: Date.now(),
                    photoData: photoBuffer,
                    changedBy: m.sender.id
                });
            }
        } else if (even === 'GROUP_CHANGE_SUBJECT') {
            const [newSubject] = parameters;
            db.data.history.push({
                type: 'subject_change',
                timestamp: Date.now(),
                oldSubject: m.chat.name,
                newSubject: newSubject,
                changedBy: m.sender.id
            });
        }
        
        await db.update();
    }
}
```

### StubType: Member Role Monitor

Monitorea cambios de roles usando hooks nativos.

```js
// @rolemonitor.stubtype.plugin.js
export default {
    stubtype: true,
    case: ['GROUP_PARTICIPANT_PROMOTE', 'GROUP_PARTICIPANT_DEMOTE'],
    script: async (m, { even, parameters, sock }) => {
        const db = await global.db.open('system:RoleChanges');
        
        if (!db.data.changes) db.data.changes = [];
        
        const [affectedUser] = parameters;
        const isPromotion = even === 'GROUP_PARTICIPANT_PROMOTE';
        
        db.data.changes.push({
            groupId: m.chat.id,
            groupName: m.chat.name,
            affectedUser: affectedUser,
            action: isPromotion ? 'promote' : 'demote',
            performedBy: m.sender.id,
            timestamp: Date.now()
        });
        
        await db.update();
        
        await sock.sendMessage(m.chat.id, {
            text: `🔄 *Cambio de rol*\n\n` +
                  `Usuario: @${affectedUser.split('@')[0]}\n` +
                  `Acción: ${isPromotion ? '⬆️ Promovido a admin' : '⬇️ Removido de admin'}\n` +
                  `Por: @${m.sender.number}`,
            mentions: [affectedUser, m.sender.id]
        });
    }
}
```

### Command: Ver Historial (Armonía con Before/StubType)

Muestra eventos registrados por plugins before y stubtype.

```js
// @history.cmd.plugin.js
export default {
    command: true,
    cmd: ['history', 'historial', 'eventos'],
    script: async (m, { sock }) => {
        const dbMessages = await global.db.open('system:EventHistory');
        const dbGroupEvents = await global.db.open('system:GroupEvents');
        
        let response = `*📊 HISTORIAL DEL BOT*\n\n`;
        
        // Estadísticas de mensajes
        const messages = dbMessages.data.messages || [];
        const myMessages = messages.filter(msg => msg.chat === m.chat.id);
        const last10 = myMessages.slice(-10);
        
        response += `*Mensajes en este chat:* ${myMessages.length}\n`;
        response += `*Total general:* ${messages.length}\n\n`;
        
        if (m.chat.isGroup) {
            const groupEvents = dbGroupEvents.data[m.chat.id] || [];
            response += `*Eventos de grupo:* ${groupEvents.length}\n\n`;
            
            if (groupEvents.length > 0) {
                response += `*Últimos 5 eventos:*\n`;
                groupEvents.slice(-5).forEach((ev, i) => {
                    const time = new Date(ev.timestamp).toLocaleTimeString('es-ES');
                    const type = ev.type.replace(/_/g, ' ').toLowerCase();
                    response += `${i + 1}. ${type} - ${time}\n`;
                });
            }
        }
        
        response += `\n${global.readMore}\n`;
        response += `*Últimos 10 mensajes:*\n`;
        last10.forEach((msg, i) => {
            const time = new Date(msg.timestamp).toLocaleTimeString('es-ES');
            response += `${i + 1}. [${time}] ${msg.fromName}: ${msg.text.slice(0, 30)}...\n`;
        });
        
        await m.reply(response);
    }
}
```

### Command: Analytics Dashboard

Dashboard de estadísticas usando datos del before tracker.

```js
// @stats.cmd.plugin.js
export default {
    command: true,
    cmd: ['stats', 'estadisticas', 'mystats'],
    script: async (m, { sock }) => {
        const db = await global.db.open('system:Analytics');
        
        const userData = db.data.users?.[m.sender.id];
        
        if (!userData) {
            return await m.reply('❌ No hay datos registrados aún.');
        }
        
        const memberSince = new Date(userData.firstSeen).toLocaleDateString('es-ES');
        const daysActive = Math.ceil((Date.now() - userData.firstSeen) / (1000 * 60 * 60 * 24));
        const avgMessages = (userData.messageCount / daysActive).toFixed(1);
        
        let response = `*📈 TUS ESTADÍSTICAS*\n\n`;
        response += `👤 *Usuario:* ${userData.name}\n`;
        response += `📱 *Número:* ${userData.number}\n`;
        response += `📅 *Miembro desde:* ${memberSince}\n`;
        response += `⏱️ *Días activo:* ${daysActive}\n\n`;
        
        response += `💬 *Mensajes enviados:* ${userData.messageCount}\n`;
        response += `⚡ *Comandos usados:* ${userData.commandCount}\n`;
        response += `📊 *Promedio/día:* ${avgMessages}\n`;
        response += `🖼️ *Medios enviados:* ${userData.mediaCount}\n\n`;
        
        response += `👥 *Grupos activos:* ${userData.groupChats.length}\n`;
        response += `💬 *Chats privados:* ${userData.privateChats}\n\n`;
        
        // Verificar roles
        if (await m.sender.role('rowner')) response += `👑 *Rol:* Super Owner\n`;
        else if (await m.sender.role('owner')) response += `🔰 *Rol:* Owner\n`;
        else if (await m.sender.role('modr')) response += `⚔️ *Rol:* Moderador\n`;
        else if (await m.sender.role('prem')) response += `💎 *Rol:* Premium\n`;
        else response += `👤 *Rol:* Usuario\n`;
        
        await m.reply(response);
        await m.react(global.settings.reactEmojis?.success || '✔️');
    }
}
```

### Command: Advanced Interactive RPG

Sistema RPG completo con `setReplyHandler` y base de datos.

```js
// @rpg.cmd.plugin.js
export default {
    command: true,
    cmd: ['rpg', 'jugar', 'aventura'],
    script: async (m, { sock }) => {
        const db = await global.db.open('game:RPG');
        
        if (!db.data.players) db.data.players = {};
        
        let player = db.data.players[m.sender.id];
        
        if (!player) {
            player = {
                name: m.sender.name,
                level: 1,
                hp: 100,
                maxHp: 100,
                atk: 10,
                def: 5,
                exp: 0,
                gold: 50,
                inventory: ['Espada básica', 'Poción menor']
            };
            db.data.players[m.sender.id] = player;
            await db.update();
        }
        
        const menu = await m.reply(
            `⚔️ *RPG ADVENTURE*\n\n` +
            `👤 *${player.name}* - Nivel ${player.level}\n` +
            `❤️ HP: ${player.hp}/${player.maxHp}\n` +
            `⚔️ ATK: ${player.atk} | 🛡️ DEF: ${player.def}\n` +
            `⭐ EXP: ${player.exp} | 💰 Oro: ${player.gold}\n\n` +
            `*Acciones:*\n` +
            `1️⃣ Batalla\n` +
            `2️⃣ Inventario\n` +
            `3️⃣ Descansar\n` +
            `4️⃣ Tienda\n\n` +
            `Responde con el número.`
        );
        
        await sock.setReplyHandler(menu, {
            state: { playerId: m.sender.id },
            routes: [
                {
                    code: {
                        guard: (reply) => reply.content.text === '1',
                        executor: async (reply, { sock, state }) => {
                            const db = await global.db.open('game:RPG');
                            const p = db.data.players[state.playerId];
                            
                            const enemyHp = 50 + (p.level * 10);
                            const enemyAtk = 5 + (p.level * 2);
                            
                            const damage = Math.max(1, p.atk - enemyAtk);
                            const enemyDamage = Math.max(1, enemyAtk - p.def);
                            
                            p.hp -= enemyDamage;
                            
                            let result = `⚔️ *BATALLA*\n\n`;
                            result += `Causaste ${damage} de daño!\n`;
                            result += `Recibiste ${enemyDamage} de daño!\n\n`;
                            
                            if (p.hp <= 0) {
                                p.hp = p.maxHp;
                                p.gold = Math.max(0, p.gold - 10);
                                result += `💀 Fuiste derrotado! -10 oro\n`;
                            } else {
                                const expGained = 20 + (p.level * 5);
                                const goldGained = 10 + (p.level * 3);
                                p.exp += expGained;
                                p.gold += goldGained;
                                
                                if (p.exp >= p.level * 100) {
                                    p.level++;
                                    p.maxHp += 20;
                                    p.hp = p.maxHp;
                                    p.atk += 3;
                                    p.def += 2;
                                    result += `🎉 ¡SUBISTE A NIVEL ${p.level}!\n`;
                                }
                                
                                result += `Victoria! +${expGained} EXP, +${goldGained} oro\n`;
                            }
                            
                            result += `\nHP actual: ${p.hp}/${p.maxHp}`;
                            
                            await db.update();
                            await reply.reply(result);
                        }
                    }
                },
                {
                    code: {
                        guard: (reply) => reply.content.text === '2',
                        executor: async (reply, { state }) => {
                            const db = await global.db.open('game:RPG');
                            const p = db.data.players[state.playerId];
                            
                            let inv = `🎒 *INVENTARIO*\n\n`;
                            p.inventory.forEach((item, i) => {
                                inv += `${i + 1}. ${item}\n`;
                            });
                            
                            await reply.reply(inv);
                        }
                    }
                },
                {
                    code: {
                        guard: (reply) => reply.content.text === '3',
                        executor: async (reply, { state }) => {
                            const db = await global.db.open('game:RPG');
                            const p = db.data.players[state.playerId];
                            
                            p.hp = p.maxHp;
                            await db.update();
                            
                            await reply.reply(`😴 Descansaste. HP restaurado a ${p.maxHp}`);
                            await reply.react(global.settings.reactEmojis?.success);
                        }
                    }
                }
            ]
        }, 120000);
    }
}
```

## Base de Datos

El sistema incluye un módulo de base de datos JSON en `library/db.js`.

```js
import $base from './library/db.js';

await $base.Start('./data');
const db = await $base.open('users');

db.data.userId = { name: 'John', credits: 50 };
await db.update();

const hasUser = await $base.has('users');
await $base.delete('users');
```

## Desarrollo

Los plugins se recargan automáticamente al detectar cambios. El formato de nomenclatura es estricto y determina el tipo de plugin.

Para crear exports globales, cualquier plugin puede incluir la propiedad `export` y será accesible desde `plugin.import()`.

El objeto `m` se construye en `core/handlers/` a través de múltiples módulos que añaden propiedades según el contexto del mensaje.
