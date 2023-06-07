import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import extractCallConfig from '../utils/restUtils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const callConfig = extractCallConfig(req)
        const userDetails = req.session.userDetails || (await userService.getUser(callConfig))
        req.session.userDetails = userDetails
        res.locals.user = { ...userDetails, ...res.locals.user }

        if (!userDetails) {
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
