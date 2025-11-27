// ./config.js

import dotenv from 'dotenv';
dotenv.config();

global.readMore = String
    .fromCharCode(8206)
    .repeat(850);

global.settings = {
    "setDBPort": 8000,
    "setServerIp": "",

    "mainBotStore": false,
    "mainBotNumber": "",
    "mainBotPrefix": ".¿?¡!#%&/,~@",
    "mainBotName": "@Jun",
    "mainBotAuto-read": true,

    "reactEmojis": {
        "waiting": "⌛",
        "success": "✔️",
        "failure": "✖️"
    },
    "SetUserRoles": {
        "5216678432366": {
            "rowner": true,
            "owner": true,
            "modr": true,
            "prem": true
        }
    }
}