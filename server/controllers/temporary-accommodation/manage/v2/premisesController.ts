import type { Request, RequestHandler, Response } from 'express'

import { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3PremisesStatus } from '@approved-premises/api'
import PremisesService from '../../../../services/v2/premisesService'
import extractCallConfig from '../../../../utils/restUtils'
import paths from '../../../../paths/temporary-accommodation/manage'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const params = req.query as PremisesSearchParameters & { status?: Cas3PremisesStatus }

      // If no status parameter, redirect to include status=online
      if (!params.status) {
        const queryString = new URLSearchParams({ ...params, status: 'online' }).toString()
        return res.redirect(`${paths.premises.v2.index({})}?${queryString}`)
      }

      const { status } = params

      const searchData = await this.premisesService.searchData(callConfig, params, status)

      return res.render('temporary-accommodation/v2/premises/index', {
        ...searchData,
        params: { ...params, status },
        status,
        isOnlineTab: status === 'online',
        isArchivedTab: status === 'archived',
      })
    }
  }
}
