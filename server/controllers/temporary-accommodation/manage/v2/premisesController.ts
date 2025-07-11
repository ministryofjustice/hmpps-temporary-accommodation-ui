import type { Request, RequestHandler, Response } from 'express'

import { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3NewPremises, Cas3PremisesStatus } from '@approved-premises/api'
import PremisesService from '../../../../services/v2/premisesService'
import extractCallConfig from '../../../../utils/restUtils'
import { createSubNavArr } from '../../../../utils/premisesSearchUtils'
import { showPropertySubNavArray } from '../../../../utils/premisesUtils'
import paths from '../../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { filterProbationRegions } from '../../../../utils/userUtils'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(status: Cas3PremisesStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const params = req.query as PremisesSearchParameters

      const searchData = await this.premisesService.searchDataAndGenerateTableRows(
        callConfig,
        params.postcodeOrAddress,
        status,
      )

      return res.render('temporary-accommodation/v2/premises/index', {
        ...searchData,
        params,
        status,
        subNavArr: createSubNavArr(status, params.postcodeOrAddress),
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
      const turnaroundWorkingDays = req.body.turnaroundWorkingDays
        ? parseInt(req.body.turnaroundWorkingDays, 10)
        : undefined

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
        turnaroundWorkingDays,
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
