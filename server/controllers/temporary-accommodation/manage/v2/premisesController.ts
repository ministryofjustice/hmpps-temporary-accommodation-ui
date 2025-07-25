import type { Request, RequestHandler, Response } from 'express'

import { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3NewPremises, Cas3PremisesStatus } from '@approved-premises/api'
import paths from '../../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../../services/v2/premisesService'
import BedspaceService from '../../../../services/v2/bedspaceService'
import extractCallConfig from '../../../../utils/restUtils'
import { createSubNavArr } from '../../../../utils/premisesSearchUtils'
import { showPropertySubNavArray } from '../../../../utils/premisesUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { filterProbationRegions } from '../../../../utils/userUtils'
import { parseNumber } from '../../../../utils/formUtils'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
  ) {}

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

  showPremisesTab(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const summary = this.premisesService.summaryList(premises)

      return res.render('temporary-accommodation/v2/premises/show', {
        premises,
        summary,
        actions: [],
        showPremises: true,
        subNavArr: showPropertySubNavArray(premisesId, 'premises'),
      })
    }
  }

  showBedspacesTab(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const [premises, bedspaces] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.getBedspacesForPremises(callConfig, premisesId),
      ])

      const bedspaceSummaries = bedspaces.bedspaces.map(bedspace => {
        const bedspaceSummary = this.bedspaceService.summaryList(bedspace)
        return {
          id: bedspace.id,
          reference: bedspace.reference,
          summary: bedspaceSummary,
        }
      })

      return res.render('temporary-accommodation/v2/premises/show', {
        premises,
        bedspaceSummaries,
        actions: [],
        showPremises: false,
        subNavArr: showPropertySubNavArray(premisesId, 'bedspaces'),
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

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { localAuthorities, characteristics, probationRegions, pdus } =
        await this.premisesService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/v2/premises/new', {
        errors,
        errorSummary,
        localAuthorities,
        characteristics,
        probationRegions: filterProbationRegions(probationRegions, req),
        pdus,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: Cas3NewPremises = {
        reference: req.body.reference,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        town: req.body.town,
        postcode: req.body.postcode,
        localAuthorityAreaId: req.body.localAuthorityAreaId,
        probationRegionId: req.body.probationRegionId,
        probationDeliveryUnitId: req.body.probationDeliveryUnitId,
        characteristicIds: req.body.characteristicIds ?? [],
        notes: req.body.notes,
        turnaroundWorkingDays: parseNumber(req.body.turnaroundWorkingDays, { allowNegatives: true }),
      }

      try {
        const callConfig = extractCallConfig(req)
        const premises = await this.premisesService.createPremises(callConfig, newPremises)

        req.flash('success', 'Property added')
        res.redirect(paths.premises.v2.show({ premisesId: premises.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.v2.new())
      }
    }
  }
}
