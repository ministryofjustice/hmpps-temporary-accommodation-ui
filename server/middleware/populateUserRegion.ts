import { RequestHandler } from 'express'
import UserService from '../services/userService'
import extractCallConfig from '../utils/restUtils'

export default function populateUserRegion(userService: UserService): RequestHandler {
  return async (req, _res, next) => {
    if (!req.session.probationRegion) {
      const callConfig = extractCallConfig(req)
      const user = await userService.getActingUser(callConfig)

      req.session.probationRegion = user.region
    }
    next()
  }
}
