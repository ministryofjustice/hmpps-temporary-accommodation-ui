import { Request } from 'express'
import { CallConfig } from '../data/restClient'

export default function extractCallConfig(req: Request): CallConfig {
  return { token: req.user.token, probationRegion: req.session.probationRegion }
}
