import bunyan, { LogLevel } from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logLevel: LogLevel =
  (process.env.BUNYAN_LOG_LEVEL as LogLevel) || process.env.NODE_ENV !== 'test' ? 'debug' : 'fatal'

const logger = bunyan.createLogger({ name: 'Temporary Accommodation UI', stream: formatOut, level: logLevel })

export default logger
