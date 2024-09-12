import type { Request, RequestHandler, Response } from 'express'

export default class RedirectsController {
  redirect(url: string, statusCode: number): RequestHandler {
    return (_req: Request, res: Response) => {
      return res.redirect(statusCode, url)
    }
  }
}
