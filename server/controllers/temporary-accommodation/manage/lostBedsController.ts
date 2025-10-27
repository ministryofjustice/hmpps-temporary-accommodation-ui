import type { Request, RequestHandler, Response } from 'express'

import type { Cas3VoidBedspaceCancellation, Cas3VoidBedspaceRequest } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, LostBedService } from '../../../services'
import PremisesService from '../../../services/premisesService'
import BedspaceService from '../../../services/bedspaceService'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import { allStatuses, lostBedActions } from '../../../utils/lostBedUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'

export default class LostBedsController {
  constructor(
    private readonly lostBedsService: LostBedService,
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      const lostBedReasons = await this.lostBedsService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/lost-beds/new', {
        premises,
        bedspace,
        lostBedReasons,
        errors,
        errorTitle,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId } = req.params
      const callConfig = extractCallConfig(req)

      const newLostBed: Cas3VoidBedspaceRequest = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate'),
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate'),
      }

      try {
        const lostBed = await this.lostBedsService.create(callConfig, premisesId, bedspaceId, newLostBed)

        req.flash('success', 'Void created')
        res.redirect(paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed.id }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'plural'))
          insertGenericError(err, 'startDate', 'conflict')
          insertGenericError(err, 'endDate', 'conflict')
        }

        // TODO: costCentre is optional in the API types right now, so we add a FE check to make sure it's present in the form.
        //  Once the API makes costCentre mandatory, remove this check and let the backend handle validation.
        if (!req.body.costCentre) {
          insertGenericError(err, 'costCentre', 'empty')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.lostBeds.new({ premisesId, bedspaceId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      await preservePlaceContext(req, res, this.assessmentService)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      const lostBed = await this.lostBedsService.find(callConfig, premisesId, bedspaceId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/show', {
        premises,
        bedspace,
        lostBed,
        actions: lostBedActions(premisesId, bedspaceId, lostBed),
        allStatuses,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const lostBedUpdate: Cas3VoidBedspaceRequest = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate'),
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate'),
      }

      try {
        const updatedLostBed = await this.lostBedsService.update(
          callConfig,
          premisesId,
          bedspaceId,
          lostBedId,
          lostBedUpdate,
        )

        req.flash('success', 'Void booking updated')
        res.redirect(paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: updatedLostBed.id }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'plural'))
          insertGenericError(err, 'startDate', 'conflict')
          insertGenericError(err, 'endDate', 'conflict')
        }

        // TODO: costCentre is optional in the API types right now, so we add a FE check to make sure it's present in the form.
        //  Once the API makes costCentre mandatory, remove this check and let the backend handle validation.
        if (!req.body.costCentre) {
          insertGenericError(err, 'costCentre', 'empty')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.lostBeds.edit({ premisesId, bedspaceId, lostBedId }))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId, bedspaceId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      const lostBedReasons = await this.lostBedsService.getReferenceData(callConfig)

      const updateLostBed = await this.lostBedsService.getUpdateLostBed(callConfig, premisesId, bedspaceId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/edit', {
        lostBedReasons,
        errors,
        errorSummary,
        errorTitle,
        premises,
        bedspace,
        lostBedId,
        ...updateLostBed,
        ...DateFormats.isoToDateAndTimeInputs(updateLostBed.startDate, 'startDate'),
        ...DateFormats.isoToDateAndTimeInputs(updateLostBed.endDate, 'endDate'),
        ...userInput,
      })
    }
  }

  newCancellation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId, bedspaceId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      const lostBed = await this.lostBedsService.find(callConfig, premisesId, bedspaceId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/cancel', {
        errors,
        errorSummary,
        premises,
        bedspace,
        lostBed,
        allStatuses,
        cancellationNotes: lostBed.notes,
        ...userInput,
      })
    }
  }

  createCancellation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const lostBedCancellation: Cas3VoidBedspaceCancellation = {
        ...req.body,
      }

      try {
        await this.lostBedsService.cancel(callConfig, premisesId, bedspaceId, lostBedId, lostBedCancellation)

        req.flash('success', 'Void booking cancelled')
        res.redirect(paths.lostBeds.show({ premisesId, bedspaceId, lostBedId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.lostBeds.cancellations.new({ premisesId, bedspaceId, lostBedId }),
        )
      }
    }
  }
}
