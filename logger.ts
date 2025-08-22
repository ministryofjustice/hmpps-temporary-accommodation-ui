import bunyan, { LogLevel } from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger = bunyan.createLogger({
  name: 'Temporary Accommodation UI',
  stream: formatOut,
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
})

export default logger
