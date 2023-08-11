import type { Request, RequestHandler, Response } from 'express'
import { userHasAssessorRoleAndIsApplyEnabled } from '../../../utils/userUtils'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const userReferralsEnabled = userHasAssessorRoleAndIsApplyEnabled(res.locals.user)
      res.render('temporary-accommodation/dashboard/index', { userReferralsEnabled })
    }
  }
}
