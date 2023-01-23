import { RequestHandler } from 'express'
import UserService from '../services/userService'

export default function populateUserRegion(userService: UserService): RequestHandler {
  return async (req, _res, next) => {
    if (!req.session.actingUserProbationRegion) {
      const user = await userService.getActingUser(req)

      req.session.actingUserProbationRegion = user.probationRegion
    }
    next()
  }
}
