import { path } from 'static-path'
import config from '../config'

const prependPath = config.serviceSignifier === 'path'

export const approvedPremisesPath = path(prependPath ? `/${config.approvedPremisesRootPath}` : '/')
