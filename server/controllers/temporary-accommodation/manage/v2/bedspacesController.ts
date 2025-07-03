import { Request, RequestHandler, Response } from 'express'
import { PageHeadingBarItem } from '@approved-premises/ui'
import extractCallConfig from '../../../../utils/restUtils'
import BedspaceService from '../../../../services/v2/bedspaceService'
import PremisesService from '../../../../services/v2/premisesService'

export default class BedspacesController {
  constructor(
    private readonly bedspaceService: BedspaceService,
    private readonly premisesService: PremisesService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const bedspace = await this.bedspaceService.getSingleBedspaceDetails(callConfig, premisesId, bedspaceId)
      const premises = await this.premisesService.getSinglePremisesDetails(callConfig, premisesId)
      const actions: Array<PageHeadingBarItem> = []

      return res.render('temporary-accommodation/v2/bedspaces/show', { premises, bedspace, actions })
    }
  }
}
