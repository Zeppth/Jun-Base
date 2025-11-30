// ./library/log.js

import util from 'util'
import $process from './process.js'
import chalk from 'chalk'

const $console = {
    send: $process.send,
    log: (...data) => {
        return $process.send({ content: { type: 'console:log', data: data } })
    },
    error(...args) {
        return this.log(chalk.white('[ '), chalk.redBright('ERROR '), chalk.white('] '), chalk.white('{ '), chalk.redBright(util.format(...args) + ' '), chalk.white('} '), chalk.redBright('!'))
    }
}

export default $console