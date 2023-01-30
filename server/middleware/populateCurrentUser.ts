import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import extractCallConfig from '../utils/restUtils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const callConfig = extractCallConfig(req)
        const user = res.locals.user && (await userService.getUser(callConfig))
        if (user) {
          res.locals.user = { ...user, ...res.locals.user }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
