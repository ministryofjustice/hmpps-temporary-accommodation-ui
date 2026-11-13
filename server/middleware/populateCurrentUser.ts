import type { UUID } from 'crypto'
import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import UserService, { DeliusAccountMissingStaffDetailsError } from '../services/userService'
import extractCallConfig from '../utils/restUtils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const { user_id: userId, user_uuid: userUuid } = jwtDecode<{ user_id?: string; user_uuid?: UUID }>(
          req.user.token,
        )
        const callConfig = extractCallConfig(req)
        const userDetails = req.session.userDetails || (await userService.getActingUser(callConfig))

        req.session.userDetails = userDetails
        req.session.probationRegion = userDetails.region

        userDetails.primaryNavigationList = userService.getActingUserPrimaryNavigationList(userDetails, req.path)

        res.locals.user = {
          ...userDetails,
          ...res.locals.user,
          userId,
          userUuid,
        }

        if (!userDetails) {
          logger.info('No user available')
        }
      }

      return next()
    } catch (error) {
      if (error instanceof DeliusAccountMissingStaffDetailsError) {
        logger.error('Delius account missing staff details')
        return res.redirect('/deliusMissingStaffDetails')
      }
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.id}`)
      return next(error)
    }
  }
}
