import type { Response, Request, RequestHandler } from 'express'

export default class ApplicationController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.redirect('/premises')
    }
  }
}
