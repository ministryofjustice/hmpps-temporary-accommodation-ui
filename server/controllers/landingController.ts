import type { Request, RequestHandler, Response } from 'express'
import { TemporaryAccommodationUser as User } from '../@types/shared'
import applyPaths from '../paths/apply'
import managePaths from '../paths/temporary-accommodation/manage'
import staticPaths from '../paths/temporary-accommodation/static'
import { UnauthorizedError } from '../utils/errors'
import {
  isApplyEnabledForUser,
  userHasAssessorRole,
  userHasReferrerRole,
  userHasReporterRole,
} from '../utils/userUtils'

export default class LandingController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const user = res.locals.user as User

      if (userHasAssessorRole(user)) {
        return res.redirect(managePaths.dashboard.index({}))
      }

      if (userHasReferrerRole(user)) {
        if (isApplyEnabledForUser(user)) {
          return res.redirect(applyPaths.applications.index({}))
        }
        return res.redirect(staticPaths.static.useNDelius.pattern)
      }

      if (userHasReporterRole(user)) {
        return res.redirect(managePaths.reports.index({}))
      }

      throw new UnauthorizedError()
    }
  }
}
