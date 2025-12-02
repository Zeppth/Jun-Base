// ./core/main.js

import {
    DisconnectReason,
    // makeInMemoryStore
} from '@whiskeysockets/baileys';
import qrTerminal from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import qrCode from 'qrcode';

// from libreria
import logger from '../library/log.js';
import $base from '../library/db.js';
import { MakeBot } from '../library/client.js';
import { Plugins } from '../library/plugins2.js';
import $process from '../library/process.js';
import $Sock from '../library/bind.js';

import handlerLoader from '../library/loader.js';

const objects = {}

try {
    // tmp
    await import('../library/purge.js')

    const { data, path: _path } = $process.env
    await $base.Start($process.env.path.store)

    await handlerLoader.loadFiles();

    const plugins = new Plugins(_path.plugins, {
        usePrefix: true,
        stubtype: false,
        command: false,
    });

    await plugins.load()

    // start
    async function StartBot(params) {
        const sock = await MakeBot(params ??
            $process.env.options, objects.store)

        Object.assign(sock, {
            plugins: plugins,
            ...(await $Sock(sock)),
            '@send': $process.send,
            subBot: data.subBot || false,
        })

        if (sock.PairingCode) $process.send({
            content: {
                event: 'pairing:pin-code',
                data: {
                    pairingCode: sock.PairingCode,
                    formattedCode: sock.PairingCode
                        .match(/.{1,4}/g)?.join("-") ??
                        sock.PairingCode
                }
            }
        })

        sock.ev.on('connection.update', async (update) => {
            const { lastDisconnect, connection, qr } = update;

            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode || 500;
                if (reason === DisconnectReason.restartRequired) {
                    await StartBot({
                        ...($process.env.options || {}),
                        connectType: 'qr-code'
                    });
                } else {
                    $process.send({
                        content: {
                            type: 'connection:close',
                            data: {
                                reasonCode: reason,
                                reasonMessage: lastDisconnect
                                    ?.error?.message ??
                                    'Unknown reason'
                            }
                        }
                    });
                    if (reason !== DisconnectReason.loggedOut)
                        await StartBot({
                            ...($process.env.options || {}),
                            connectType: 'qr-code'
                        });
                }
            }

            if (connection === 'open') $process.send({
                content: {
                    type: 'connection:open',
                    data: {
                        ...data,
                        ...sock.user,
                        isConnected: true,
                        id: sock.user.id.split(":")[0]
                            + "@s.whatsapp.net"
                    }
                }
            })

            if (qr) $process.send({
                content: {
                    event: 'pairing:qr-code',
                    data: {
                        rawQrCode: qr,
                        qrCodeImage: await qrCode.toDataURL(qr),
                        qrCodeText: await new Promise((resolve) =>
                            qrTerminal.generate(qr, { small: true },
                                (qrCode) => resolve(qrCode)))
                    }
                }
            })
        })

        sock.ev.on('call', async (call) => {
            const callInfo = call[0]
            if (callInfo.status === 'offer') {
                await sock.rejectCall(callInfo.id, callInfo.from)
            }
        })

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const chatUpdate = handlerLoader
                    .get('core.handler.js')
                await chatUpdate.default(m, sock)
            } catch (e) {
                logger.error(e);
            }
        })
    }

    await StartBot()
} catch (e) {
    logger.error(e);
    new Error(e)
}