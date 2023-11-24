import type { Request, RequestHandler, Response } from 'express'

import type { NewPremises, UpdatePremises } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import PremisesService from '../../../services/premisesService'
import { parseNaturalNumber } from '../../../utils/formUtils'
import { allStatuses, getActiveStatuses, premisesActions } from '../../../utils/premisesUtils'
import extractCallConfig from '../../../utils/restUtils'
import { filterProbationRegions } from '../../../utils/userUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const placeContext = await preservePlaceContext(req, res, this.assessmentService)

      const tableRows = await this.premisesService.tableRows(callConfig, placeContext)
      return res.render('temporary-accommodation/premises/index', {
        tableRows,
        useLocalAuthorityTableHeader: callConfig.probationRegion?.config?.flags.properties.useLAnotPDU,
      })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const {
        localAuthorities: allLocalAuthorities,
        characteristics: allCharacteristics,
        probationRegions: allProbationRegions,
        pdus: allPdus,
      } = await this.premisesService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/premises/new', {
        allLocalAuthorities,
        allCharacteristics,
        allProbationRegions: filterProbationRegions(allProbationRegions, req),
        allPdus,
        allStatuses: getActiveStatuses(allStatuses),
        characteristicIds: [],
        errors,
        errorSummary,
        probationRegionId: req.session.probationRegion.id,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: NewPremises = {
        characteristicIds: [],
        ...req.body,
        turnaroundWorkingDayCount: parseNaturalNumber(req.body.turnaroundWorkingDayCount),
      }

      try {
        const callConfig = extractCallConfig(req)

        const { id: premisesId } = await this.premisesService.create(callConfig, newPremises)

        if (req.body.status === 'archived') {
          req.flash('success', 'Archived property created')
        } else {
          req.flash('success', 'Property created')
        }
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new({}))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId } = req.params
      const callConfig = extractCallConfig(req)

      const {
        localAuthorities: allLocalAuthorities,
        characteristics: allCharacteristics,
        probationRegions: allProbationRegions,
        pdus: allPdus,
      } = await this.premisesService.getReferenceData(callConfig)

      const updatePremises = await this.premisesService.getUpdatePremises(callConfig, premisesId)

      return res.render('temporary-accommodation/premises/edit', {
        allLocalAuthorities,
        allCharacteristics,
        allProbationRegions: filterProbationRegions(allProbationRegions, req),
        allPdus,
        allStatuses: getActiveStatuses(allStatuses),
        characteristicIds: [],
        errors,
        errorSummary,
        ...updatePremises,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const callConfig = extractCallConfig(req)

      const { name } = req.body

      const premises = await this.premisesService.getPremises(callConfig, premisesId)

      const newPremisesName = name === premises.name ? null : name

      const updatePremises: UpdatePremises = {
        characteristicIds: [],
        ...req.body,
        name: newPremisesName,
        turnaroundWorkingDayCount: parseNaturalNumber(req.body.turnaroundWorkingDayCount),
      }

      try {
        await this.premisesService.update(callConfig, premisesId, updatePremises)

        if (req.body.status === 'archived') {
          req.flash('success', 'Property has been archived')
        } else {
          req.flash('success', 'Property updated')
        }

        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.edit({ premisesId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      await preservePlaceContext(req, res, this.assessmentService)

      const details = await this.premisesService.getPremisesDetails(callConfig, premisesId)

      const bedspaceDetails = await this.bedspaceService.getBedspaceDetails(callConfig, premisesId)

      return res.render('temporary-accommodation/premises/show', {
        ...details,
        bedspaces: bedspaceDetails,
        actions: premisesActions(details.premises),
      })
    }
  }
}
