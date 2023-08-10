import { NextFunction, Request, RequestHandler, Response } from 'express'
import { TemporaryAccommodationUser as User } from '../@types/shared'
import { UnauthorizedError } from '../utils/errors'

export const createUserCheckMiddleware = (check: (user: User) => boolean) => {
  return (handler: RequestHandler) => wrapHandler(handler, check)
}

const wrapHandler =
  (handler: RequestHandler, check: (user: User) => boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (check(res.locals.user)) {
      await handler(req, res, next)
    } else {
      next(new UnauthorizedError())
    }
  }
