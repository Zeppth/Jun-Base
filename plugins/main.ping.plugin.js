// folder: /plugins/main.ping.plugin.js

import { performance } from 'perf_hooks'
import { exec } from 'child_process'

export default {
    command: true,
    usePrefix: true,
    case: ['ping', 'p'],
    category: ['main'],
    usage: ['ping'],
    script: async (m) => {
        let timestamp = performance.now()

        exec(`uname -sr && cat /proc/meminfo | grep MemTotal`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error ejecutando comandos del sistema: ${error.message}`)
                return sock.sendMessage(m.chat.id, { text: 'Error al ejecutar el comando.' })
        }

            let systemInfo = stdout.toString("utf-8")
            let latencia = performance.now() - timestamp

            const text = `*» Velocidad:* ${latencia.toFixed(4)} _ms_\n\n${systemInfo}`
              m.reply(text)
        })
    }
}

