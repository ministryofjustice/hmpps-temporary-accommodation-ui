import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger =
  process.env.NODE_ENV !== 'test'
    ? bunyan.createLogger({ name: 'Temporary Accommodation UI', stream: formatOut, level: 'debug' })
    : bunyan.createLogger({ name: 'Temporary Accommodation UI', stream: formatOut, level: 'fatal' })

export default logger
