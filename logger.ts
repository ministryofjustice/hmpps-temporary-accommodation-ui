import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger =
  process.env.NODE_ENV !== 'test'
    ? bunyan.createLogger({ name: 'Approved Premises Ui', stream: formatOut, level: 'debug' })
    : bunyan.createLogger({ name: 'Approved Premises Ui', stream: formatOut, level: 'fatal' })

export default logger
