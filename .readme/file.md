# Objeto `m`

El objeto `m` se construye en `core.handler.js` y se enriquece mediante varios submódulos (`m.*.js`). Es el argumento principal que reciben tus plugins y scripts.

## Propiedades Raíz
## `m` (Propiedades Raíz)
Propiedades accesibles directamente desde `m`.

*   **Propiedades:**
    * `m.id`: ID único del mensaje (`message.key.id`).
    * `m.message`: Objeto crudo del mensaje (Raw WebMessageInfo).
    * `m.type`: Tipo de mensaje principal (ej. `conversation`, `imageMessage`).
    * `m.body`: Contenido textual completo del mensaje.
    * `m.isCmd`: `true` si el mensaje fue detectado como un comando.
    * `m.command`: Palabra clave del comando (ej. `menu` si se escribió `.menu`).
    * `m.args`: Argumentos del mensaje separados por espacios (sin el comando).
    * `m.text`: Texto del mensaje sin el comando.
    * `m.tag`: Valores extraídos de etiquetas tipo `tag=valor`.
    * `m.plugin`: Información del plugin que se está ejecutando (si aplica).

---

## `m.bot` (Identidad del Bot)
Información y acciones relativas al propio Bot.

*   **Propiedades:**
    *   `m.bot.name`: Nombre del bot.
    *   `m.bot.id`: JID del bot (ej. `12345@lid`).
    *   `m.bot.number`: Número de teléfono del bot.
    *   `m.bot.fromMe`: Boolean. `true` si el mensaje lo envió el propio bot.
    *   `m.bot.roles`: Objeto con los roles del bot (ej. si es admin).

*   **Métodos:**
    *   `m.bot.getDesc()`: Obtiene la info/estado del perfil del bot.
    *   `m.bot.getPhoto()`: Obtiene la URL de la foto de perfil.
    *   `m.bot.setPhoto(image)`: Cambia la foto de perfil.
    *   `m.bot.setDesc(desc)`: Cambia la info/estado.
    *   `m.bot.setName(name)`: Cambia el nombre de perfil.
    *   `m.bot.join(link)`: Se une a un grupo mediante enlace.
    *   `m.bot.mute(id, bool, time)`: Silencia un chat (necesita ser admin en grupos).
    *   `m.bot.block(id, bool)`: Bloquea o desbloquea a un usuario.
    *   `m.bot.role(rol)`: Verifica si el bot tiene un rol específico.

---

## `m.chat` (Información del Chat)
Maneja la información del contexto donde se envió el mensaje (Grupo o Privado).

*   **Propiedades Generales:**
    *   `m.chat.id`: JID del chat (grupo o usuario).
    *   `m.chat.isGroup`: Boolean. `true` si es un grupo.
    *   `m.chat.db()`: Función para acceder a la base de datos del chat.

*   **Propiedades de Grupo (Solo si `isGroup` es true):**
    *   `m.chat.name`: Nombre del grupo.
    *   `m.chat.desc`: Descripción del grupo.
    *   `m.chat.size`: Cantidad de participantes.
    *   `m.chat.owner`: JID del creador del grupo.
    *   `m.chat.admins`: Array de JIDs de los administradores.
    *   `m.chat.participants`: Array con datos de todos los miembros.

*   **Métodos (Principalmente Grupos):**
    *   `m.chat.add(user)`: Añade un usuario.
    *   `m.chat.remove(user)`: Elimina un usuario.
    *   `m.chat.promote(user)`: Da administrador a un usuario.
    *   `m.chat.demote(user)`: Quita administrador a un usuario.
    *   `m.chat.setPhoto(image)`: Cambia la imagen del grupo.
    *   `m.chat.setName(name)`: Cambia el nombre del grupo.
    *   `m.chat.setDesc(desc)`: Cambia la descripción.
    *   `m.chat.getLinkInvite()`: Obtiene el link de invitación.
    *   `m.chat.revoke()`: Revoca el enlace de invitación.
    *   `m.chat.settings.lock(bool)`: Cierra/Abre el grupo (solo admins escriben).
    *   `m.chat.settings.announce(bool)`: Configura modo anuncios.
    *   `m.chat.getMessage(id)`: Recupera un mensaje antiguo del historial (si está activado).

---

## `m.sender` (Remitente)
Información sobre quien envió el mensaje.

*   **Propiedades:**
    *   `m.sender.id`: JID del usuario.
    *   `m.sender.name`: Nombre (PushName) o nombre en base de datos.
    *   `m.sender.number`: Número de teléfono.
    *   `m.sender.mentioned`: Array de JIDs mencionados en el mensaje.
    *   `m.sender.roles`: Objeto con roles (`admin`, `rowner`, `modr`, `prem`, `banned`, etc.).

*   **Métodos:**
    *   `m.sender.getDesc()`: Obtiene el estado textual del usuario.
    *   `m.sender.getPhoto()`: Obtiene la foto de perfil.
    *   `m.sender.role('admin', 'owner'...)`: Devuelve `true` si el usuario tiene alguno de los roles pasados.

---

## `m.content` (Contenido)
Detalles específicos sobre el contenido del mensaje.

*   `m.content.text`: Texto extraído (incluso de captions de imágenes).
*   `m.content.args`: Array de palabras del texto.
*   `m.content.media`: `false` si no hay media. Si hay media (imagen/video), es un objeto:
    *   `mimeType`: Tipo MIME (ej. `image/jpeg`).
    *   `fileName`: Nombre del archivo.
    *   `download()`: **Función asíncrona** para descargar y obtener el buffer del archivo.

---

## `m.quoted` (Mensaje Citado)
Si el mensaje responde a otro, este objeto existe. Si no, es `undefined` o propiedades vacías.

*   `m.quoted.id`: ID del mensaje citado.
*   `m.quoted.type`: Tipo de mensaje citado.
*   `m.quoted.content`: Estructura idéntica a `m.content` (tiene `.text`, `.media`, `.download()`).
*   `m.quoted.sender`: Estructura similar a `m.sender` (tiene `.id`, `.roles`, `.role()`).

---

## Métodos de Utilidad (Acciones Rápidas)
Funciones inyectadas para interactuar rápidamente.

| Método | Argumentos | Descripción |
| :--- | :--- | :--- |
| `m.reply` | `(text/object)` | Responde al mensaje actual. Soporta texto plano o un objeto de mensaje de Baileys. Menciona automáticamente si se usan `@tags`. |
| `m.react` | `(emoji/string)` | Reacciona al mensaje. Soporta emojis directos o palabras clave: `'done'` (✔️), `'wait'` (⌛), `'error'` (✖️). |
| `m.sms` | `(type)` | Envía mensajes predefinidos de sistema. Tipos: `'owner'`, `'group'`, `'admin'`, `'botAdmin'`, `'premium'`, etc. |

---