import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService, { DeliusAccountMissingStaffDetailsError } from '../services/userService'
import extractCallConfig from '../utils/restUtils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const callConfig = extractCallConfig(req)
        const userDetails = req.session.userDetails || (await userService.getActingUser(callConfig))

        req.session.userDetails = userDetails
        req.session.probationRegion = userDetails.region

        userDetails.primaryNavigationList = userService.getActingUserPrimaryNavigationList(userDetails, req.path)

        res.locals.user = { ...userDetails, ...res.locals.user }

        if (!userDetails) {
          logger.info('No user available')
        }
      }

      return next()
    } catch (error) {
      if (error instanceof DeliusAccountMissingStaffDetailsError) {
        res.status(403)
        return res.redirect('/not-authorised')
      }
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      return next(error)
    }
  }
}
