import type { NextFunction, Request, RequestHandler, Response } from 'express'

export default function asyncMiddleware(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
