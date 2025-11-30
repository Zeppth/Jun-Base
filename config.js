// ./config.js
import { color } from './library/utils.js';

import dotenv from 'dotenv';
dotenv.config();

global.googleApiKey = process.env.GOOGLE_API_KEY || ''

global.readMore = String
    .fromCharCode(8206)
    .repeat(850);


global.config = {
    name: "Jun",
    prefixes: ".¿?¡!#%&/,~@",
    saveHistory: true,
    autoRead: true
};

global.config.userRoles = {
    "5216678432366": {
        root: true,
        owner: true,
        mod: true,
        vip: true
    }
}

global.REACT_EMOJIS = {
    wait: "⌛",
    done: "✔️",
    error: "✖️"
}

global.MSG = {
    root: 'Este comando solo puede ser utilizado por el *dueño*',
    owner: 'Este comando solo puede ser utilizado por un *propietario*',
    mod: 'Este comando solo puede ser utilizado por un *moderador*',
    vip: 'Esta solicitud es solo para usuarios *premium*',
    group: 'Este comando solo se puede usar en *grupos*',
    private: 'Este comando solo se puede usar por *chat privado*',
    admin: 'Este comando solo puede ser usado por los *administradores del grupo*',
    botAdmin: 'El bot necesita *ser administrador* para usar este comando',
    unreg: 'Regístrese para usar esta función escribiendo:\n\n.registrar nombre.edad',
    restrict: 'Esta función está desactivada'
}


global.PLUGINS_MSG = {
    newPlugin: `${color.bg.rgb(119, 205, 255)}${color.rgb(0, 0, 0)}Nuevo plugin: ${color.rgb(255, 255, 255)}${color.reset}`,
    updatedPlugin: `${color.bg.rgb(239, 250, 142)}${color.rgb(0, 0, 0)}Recargando plugin: ${color.rgb(255, 255, 255)}${color.reset}`,
    deletedPlugin: `${color.bg.rgb(241, 114, 114)}${color.rgb(0, 0, 0)}Plugin eliminado: ${color.rgb(255, 255, 255)}${color.reset}`
}