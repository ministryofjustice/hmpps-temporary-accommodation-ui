import type { Request, Response, RequestHandler, ShowRequest, ShowRequestHandler } from 'express'

import PremisesService from '../services/premisesService'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows()
      return res.render('premises/index', { tableRows })
    }
  }

  show(): ShowRequestHandler {
    return async (req: ShowRequest, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.params.id)
      return res.render('premises/show', { premises })
    }
  }
}
