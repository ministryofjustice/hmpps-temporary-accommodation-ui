/* istanbul ignore file */

import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import paths from './paths/temporary-accommodation/static'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user ID '${res.locals.user?.id}'`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('User not authorised')
      return res.redirect(paths.static.notAuthorised({}))
    }

    res.locals.message = error.message
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
