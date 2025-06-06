import type { Request, RequestHandler, Response } from 'express'

import { PremisesSearchParameters } from '@approved-premises/ui'
import PremisesService from '../../../../services/v2/premisesService'
import extractCallConfig from '../../../../utils/restUtils'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const params = req.query as PremisesSearchParameters

      const tableRows = await this.premisesService.tableRows(callConfig, params)
      return res.render('temporary-accommodation/v2/premises/index', { tableRows, params })
    }
  }
}
