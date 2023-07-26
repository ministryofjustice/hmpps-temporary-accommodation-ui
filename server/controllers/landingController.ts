import type { Request, RequestHandler, Response } from 'express'
import { TemporaryAccommodationUser as User } from '../@types/shared'
import applyPaths from '../paths/apply'
import managePaths from '../paths/temporary-accommodation/manage'
import { UnauthorizedError } from '../utils/errors'

export default class LandingController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const user = res.locals.user as User

      if (user.roles.includes('assessor')) {
        return res.redirect(managePaths.dashboard.index({}))
      }
      if (user.roles.includes('referrer')) {
        return res.redirect(applyPaths.applications.index({}))
      }

      throw new UnauthorizedError()
    }
  }
}
