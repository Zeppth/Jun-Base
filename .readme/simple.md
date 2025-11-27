# SimpleBase - Framework para Bots de WhatsApp

SimpleBase es un framework modular para crear bots de WhatsApp sobre **Baileys**. Su arquitectura separa el proceso de conexión (`fork`) del núcleo lógico, permitiendo recarga de plugins en caliente y un manejo robusto de errores.

## 🚀 Instalación y Uso

### Requisitos
- Node.js v18+
- FFMPEG (opcional, para stickers/media)

### Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración (Opcional):**
   Edita `config.js` para establecer roles, prefijos y la API Key de Google (Gemini).

3. **Iniciar:**
   ```bash
   npm start
   ```
   *El sistema iniciará un asistente interactivo en la terminal donde podrás elegir entre conexión por **Código QR** o **Pairing Code**.*

---

## 🧩 Arquitectura de Objetos

El framework inyecta objetos enriquecidos en cada plugin para facilitar el desarrollo.

### Objeto `m` (Mensaje)
Es una abstracción del mensaje de Baileys procesada en `core/handlers`.

| Propiedad | Descripción |
|-----------|-------------|
| `m.chat.id` | ID del chat (JID). |
| `m.text` | Texto del mensaje limpio (sin prefijo ni comando). |
| `m.sender.id` | ID del usuario que envía el mensaje. |
| `m.isGroup` | Booleano, si es un grupo. |
| `m.isCmd` | Booleano, si fue detectado como comando. |
| `m.command` | El comando extraído (ej: `menu`). |
| `m.content.media` | Objeto `{ download() }` si hay multimedia. |

**Funciones útiles de `m`:**
```javascript
await m.reply("Hola")              // Responde al mensaje
await m.reply({ image: buffer })   // Responde con media
await m.react("✅")                // Reacciona con emoji
m.sms('admin')                     // Envía mensaje de error predefinido (solo admins)
```

### Objeto `sock` (Socket)
El cliente de Baileys extendido en `library/bind.js`.

| Método | Descripción |
|--------|-------------|
| `sock.setReplyHandler` | Establece un flujo de conversación interactivo. |
| `sock.plugins.import` | Importa funciones de otros plugins. |
| `sock.downloadMedia` | Descarga multimedia de un mensaje. |
| `sock.resizePhoto` | Redimensiona imágenes (útil para miniaturas). |

---

## 🔌 Sistema de Plugins

Los archivos en la carpeta `plugins/` se cargan automáticamente. Un plugin exporta un objeto por defecto.

### Tipos de Plugin

1. **Commands (`command: true`)**: Se ejecutan cuando el usuario escribe el prefijo + comando.
2. **Before (`before: true`)**: Middleware que se ejecuta en cada mensaje *antes* o *después* de procesar comandos, según el `index`.
3. **StubType (`stubtype: true`)**: Maneja eventos de protocolo (gente entrando a grupos, cambios de título, etc).
4. **Export**: Plugins que solo sirven como librerías para otros plugins.

### Índices de Ejecución (Before)
- `index: 1`: Ejecuta antes de casi todo (ideal anti-spam).
- `index: 2`: Ejecuta antes de detectar comandos.
- `index: 3`: Ejecuta al final (ideal para IAs que responden si no hubo comando).

---

## 💡 Ejemplos de Implementación Real

A continuación, 3 ejemplos de cómo los plugins interactúan entre sí usando la Base de Datos (`global.db`) y el sistema de `export/import`.

### 1. Plugin Export: Sistema de Economía (Base)
*Archivo: `plugins/rpg/@economy.plugin.js`*
Este plugin no hace nada por sí mismo, pero provee funciones para otros.

```javascript
const plugin = {
    export: {
        '@economy': {
            // Función para añadir dinero
            addMoney: async (userId, amount) => {
                const db = await global.db.open('rpg_economy');
                if (!db.data[userId]) db.data[userId] = { money: 0 };
                
                db.data[userId].money += amount;
                await db.update();
                return db.data[userId].money;
            },
            // Función para ver balance
            getBalance: async (userId) => {
                const db = await global.db.open('rpg_economy');
                return db.data[userId]?.money || 0;
            }
        }
    }
}
export default plugin;
```

### 2. Plugin StubType: Bienvenida con Recompensa
*Archivo: `plugins/group/welcome.plugin.js`*
Detecta cuando alguien entra y usa el plugin de economía anterior.

```javascript
const plugin = {
    stubtype: true,
    case: ['GROUP_PARTICIPANT_ADD'], // Evento de Baileys
    
    script: async (m, { sock, plugin, parameters }) => {
        // Importamos la librería de economía definida arriba
        const economy = plugin.import('@economy');
        const newMember = parameters[0]; // Array de JIDs agregados

        // Lógica de bienvenida
        const text = `👋 Bienvenido @${newMember.split('@')[0]} al grupo.\n💰 Has recibido $100 de regalo.`;
        
        await sock.sendMessage(m.chat.id, { 
            text: text, 
            contextInfo: { mentionedJid: [newMember] } 
        });

        // Usamos la función exportada
        if (economy) {
            await economy.addMoney(newMember, 100);
        }
    }
}
export default plugin;
```

### 3. Plugin Command Avanzado: Apuesta Interactiva
*Archivo: `plugins/rpg/bet.plugin.js`*
Usa `setReplyHandler` para crear un flujo de conversación sin comandos repetidos.

```javascript
const plugin = {
    command: true,
    case: ['apostar', 'bet'],
    usage: ['.bet <cantidad>'],
    
    script: async (m, { sock, plugin }) => {
        const economy = plugin.import('@economy');
        const amount = parseInt(m.args[0]);
        const userBalance = await economy.getBalance(m.sender.id);

        if (!amount || amount > userBalance) {
            return m.reply(`❌ No tienes suficiente dinero. Tienes: $${userBalance}`);
        }

        // Iniciamos flujo interactivo
        await m.reply(`🎲 Vas a apostar *$${amount}*. \nResponde con *SI* para confirmar o *NO* para cancelar.`);

        // Handler de respuesta
        await sock.setReplyHandler(m.message, {
            security: {
                userId: m.sender.id, // Solo este usuario puede responder
                chatId: m.chat.id
            },
            lifecycle: {
                expiresAt: Date.now() + 30000, // 30 segundos para responder
                consumeOnce: true // Se elimina tras la respuesta
            },
            state: { amount }, // Guardamos la cantidad en el estado
            routes: [{
                code: {
                    executor: async (msg, { sock, state }) => {
                        const text = msg.body.toLowerCase();
                        
                        if (text === 'no') return msg.reply('❌ Apuesta cancelada.');
                        
                        if (text === 'si') {
                            const win = Math.random() > 0.5;
                            const db = await global.db.open('rpg_economy');
                            
                            if (win) {
                                db.data[msg.sender.id].money += state.amount;
                                await msg.reply(`🎉 ¡Ganaste! Ahora tienes $${db.data[msg.sender.id].money}`);
                            } else {
                                db.data[msg.sender.id].money -= state.amount;
                                await msg.reply(`📉 Perdiste. Ahora tienes $${db.data[msg.sender.id].money}`);
                            }
                            await db.update();
                        }
                    }
                }
            }]
        });
    }
}
export default plugin;
```

---

## 💾 Base de Datos (JSON)

El framework incluye un gestor de base de datos JSON ligero en `library/db.js`.

```javascript
// Abrir (crea el archivo si no existe)
const db = await global.db.open('nombre_archivo');

// Escribir
db.data.usuarios = { "123": "test" };

// Guardar cambios (CRÍTICO: Si no llamas esto, no se guarda)
await db.update();
```

---

## 🤖 Integración IA (Google Gemini)

Si configuraste la `GOOGLE_API_KEY`, puedes usar la IA en tus plugins. El asistente principal ya está configurado en `plugins/servicio/@asistente.js`.

Para usar herramientas personalizadas (Function Calling), revisa `plugins/servicio/@asistente.tools.plugin.js` y agrega tus propias funciones en el objeto `plugin.export['@asistente/tools']`.