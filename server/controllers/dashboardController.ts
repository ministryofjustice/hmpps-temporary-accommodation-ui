import type { Response, Request, RequestHandler } from 'express'
import managePaths from '../paths/temporary-accommodation/manage'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.redirect(managePaths.premises.index({}))
    }
  }
}
