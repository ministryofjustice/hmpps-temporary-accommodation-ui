import type { Request, RequestHandler, Response } from 'express'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/dashboard/index')
    }
  }
}
