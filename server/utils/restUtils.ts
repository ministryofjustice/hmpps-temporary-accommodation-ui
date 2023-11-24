import { Request } from 'express'
import { CallConfigLocal } from '../@types/ui'

export default function extractCallConfig(req: Request): CallConfigLocal {
  return { token: req.user.token, probationRegion: req.session.probationRegion }
}
