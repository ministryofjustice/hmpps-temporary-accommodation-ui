import { NextFunction, Request, RequestHandler, Response } from 'express'
import paths from '../paths/temporary-accommodation/manage'
import { TemporaryAccommodationUser as User } from '../@types/shared'
import { UnauthorizedError } from '../utils/errors'
import { userHasAssessorRole, userHasReporterRole } from '../utils/userUtils'

export const createUserCheckMiddleware = (check: (user: User, path: string) => boolean) => {
  return (handler: RequestHandler) => wrapHandler(handler, check)
}

const wrapHandler =
  (handler: RequestHandler, check: (user: User, path: string) => boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (check(res.locals.user, req.path)) {
      await handler(req, res, next)
    } else {
      next(new UnauthorizedError())
    }
  }

const isReportPath = (path: string): boolean => path === paths.reports.new({}) || path === paths.reports.create({})

const userHasReporterRoleAndPathIsReports = (user: User, path: string): boolean =>
  userHasReporterRole(user) && isReportPath(path)

export const userIsAuthorisedForManage = (user: User, path: string): boolean =>
  userHasAssessorRole(user) || userHasReporterRoleAndPathIsReports(user, path)
