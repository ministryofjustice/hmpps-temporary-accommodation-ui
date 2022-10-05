import type { Response, Request, RequestHandler } from 'express'
import apManagePaths from '../paths/manage'
import { getService } from '../utils/applicationUtils'

export default class ApplicationController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      const service = getService(_req)

      if (service === 'approved-premises') {
        res.redirect(apManagePaths.premises.index({}))
      } else {
        res.render('temporary-accommodation/index')
      }
    }
  }
}
