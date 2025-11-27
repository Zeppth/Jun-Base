// ./library/run.question.js

import { createInterface } from 'readline/promises';
import fs from "fs";

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

export const question = async (text) =>
    await new Promise(async resolve =>
        resolve(await readline.question(text)));

export default async () => {
    const creds = fs.existsSync(`${global.$dir_main.creds}/creds.json`);

    let connection = null
    if (!connection && !creds) {
        while (true) {
            if (!connection && !creds) {
                let text = ''
                text += '\n\x1b[1;31m~\x1b[1;37m> '
                text += '¿Cómo desea conectarse?\n'
                text += '1. Código QR.\n'
                text += '2. Código de 8 dígitos.\n'
                text += 'Escriba "exit" para cancelar.\n'
                text += '\x1b[1;31m~\x1b[1;37m> '

                const opcion = (await question(text)).trim();

                if (opcion === 'exit') break;

                if (opcion === '1') {
                    readline.close();
                    return {
                        connectType: 'qr-code',
                        phoneNumber: ''
                    };
                }

                if (opcion === '2') {
                    while (true) {
                        let text = ''
                        text += '\n\x1b[1;31m~\x1b[1;37m> '
                        text += '¿Cuál es el número que desea asignar como Bot?\n'
                        text += '(Escriba "back" para volver)\n'
                        text += '\x1b[1;31m~\x1b[1;37m> '
                        let numero = await question(text);
                        numero = numero.trim();


                        if (numero.toLowerCase() === 'back') break;
                        if (!numero) {
                            console.log('\x1b[1;33mEl número es obligatorio. Por favor ingrese un número válido.\x1b[0m');
                            continue;
                        }

                        readline.close();
                        return {
                            connectType: 'pin-code',
                            phoneNumber: numero
                        };
                    }
                } else {
                    console.log('\x1b[1;33mOpción no válida. Intente de nuevo.\x1b[0m');
                }
            }
        }
        readline.close();
        return {
            connectType: 'qr-code',
            phoneNumber: ''
        };
    }
}