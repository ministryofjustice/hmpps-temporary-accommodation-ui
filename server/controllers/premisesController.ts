import type { Request, Response, RequestHandler } from 'express'

import PremisesService from '../services/premisesService'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows()
      return res.render('premises/index', { tableRows })
    }
  }
}
