import type { Response, Request, RequestHandler } from 'express'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/dashboard/index')
    }
  }
}
