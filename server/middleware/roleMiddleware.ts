import { NextFunction, Request, RequestHandler, Response } from 'express'
import { TemporaryAccommodationUserRole as UserRole } from '../@types/shared'
import { UnauthorizedError } from '../utils/errors'

export const createRoleMiddleware = (role: UserRole) => {
  return (handler: RequestHandler) => wrapHandler(handler, role)
}

const wrapHandler =
  (handler: RequestHandler, role: UserRole) => async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.roles.includes(role)) {
      await handler(req, res, next)
    } else {
      next(new UnauthorizedError())
    }
  }
