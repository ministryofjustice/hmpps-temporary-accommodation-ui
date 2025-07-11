import type { Request, RequestHandler, Response } from 'express'
import { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3PremisesStatus } from '@approved-premises/api'
import paths from '../../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../../services/v2/premisesService'
import extractCallConfig from '../../../../utils/restUtils'
import { createSubNavArr } from '../../../../utils/premisesSearchUtils'
import { showPropertySubNavArray } from '../../../../utils/premisesUtils'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(status: Cas3PremisesStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const params = req.query as PremisesSearchParameters

      const premisesSortBy = req.session.premisesSortBy || 'pdu'

      const searchData = await this.premisesService.searchDataAndGenerateTableRows(
        callConfig,
        params.postcodeOrAddress,
        status,
        premisesSortBy,
      )

      return res.render('temporary-accommodation/v2/premises/index', {
        ...searchData,
        params,
        status,
        subNavArr: createSubNavArr(status, params.postcodeOrAddress),
        premisesSortBy,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const summary = this.premisesService.summaryList(premises)

      return res.render('temporary-accommodation/v2/premises/show', {
        premises,
        summary,
        actions: [],
        subNavArr: showPropertySubNavArray(premisesId, 'premises'),
      })
    }
  }

  toggleSort(): RequestHandler {
    return async (req: Request, res: Response) => {
      const currentSort = req.session.premisesSortBy || 'pdu'
      const newSort = currentSort === 'pdu' ? 'la' : 'pdu'

      req.session.premisesSortBy = newSort

      const query = new URLSearchParams(req.query as Record<string, string>).toString()
      const redirectUrl = paths.premises.v2.online() + (query ? `?${query}` : '')

      res.redirect(redirectUrl)
    }
  }
}
