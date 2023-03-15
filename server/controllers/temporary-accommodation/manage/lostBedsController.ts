import type { Request, RequestHandler, Response } from 'express'

import type {
  NewTemporaryAccommodationLostBed as NewLostBed,
  NewLostBedCancellation,
  UpdateTemporaryAccommodationLostBed as UpdateLostBed,
} from '@approved-premises/api'
import { LostBedService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import extractCallConfig from '../../../utils/restUtils'
import { DateFormats } from '../../../utils/dateUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { allStatuses, lostBedActions } from '../../../utils/lostBedUtils'

export default class LostBedsController {
  constructor(
    private readonly lostBedsService: LostBedService,
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const lostBedReasons = await this.lostBedsService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/lost-beds/new', {
        premises,
        room,
        lostBedReasons,
        errors,
        errorSummary: requestErrorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const callConfig = extractCallConfig(req)

      const newLostBed: NewLostBed = {
        serviceName: 'temporary-accommodation',
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'startDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'endDate'),
      }

      try {
        const lostBed = await this.lostBedsService.create(callConfig, premisesId, newLostBed)

        req.flash('success', 'Void created')
        res.redirect(paths.lostBeds.show({ premisesId, roomId, lostBedId: lostBed.id }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'startDate', 'conflict')
          insertGenericError(err, 'endDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.lostBeds.new({ premisesId, roomId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const lostBed = await this.lostBedsService.find(callConfig, premisesId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/show', {
        premises,
        room,
        lostBed,
        actions: lostBedActions(premisesId, roomId, lostBed),
        allStatuses,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const lostBedUpdate: UpdateLostBed = {
        serviceName: 'temporary-accommodation',
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'startDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'endDate'),
      }

      try {
        const updatedLostBed = await this.lostBedsService.update(callConfig, premisesId, lostBedId, lostBedUpdate)

        req.flash('success', 'Void booking updated')
        res.redirect(paths.lostBeds.show({ premisesId, roomId, lostBedId: updatedLostBed.id }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'startDate', 'conflict')
          insertGenericError(err, 'endDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.lostBeds.edit({ premisesId, roomId, lostBedId }))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId, roomId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const lostBedReasons = await this.lostBedsService.getReferenceData(callConfig)

      const updateLostBed = await this.lostBedsService.getUpdateLostBed(callConfig, premisesId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/edit', {
        lostBedReasons,
        errors,
        errorSummary,
        premises,
        room,
        lostBedId,
        ...updateLostBed,
        ...DateFormats.convertIsoToDateAndTimeInputs(updateLostBed.startDate, 'startDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(updateLostBed.endDate, 'endDate'),
        ...userInput,
      })
    }
  }

  newCancellation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId, roomId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const lostBed = await this.lostBedsService.find(callConfig, premisesId, lostBedId)

      return res.render('temporary-accommodation/lost-beds/cancel', {
        errors,
        errorSummary,
        premises,
        room,
        lostBed,
        allStatuses,
        notes: lostBed.notes,
        ...userInput,
      })
    }
  }

  createCancellation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, lostBedId } = req.params
      const callConfig = extractCallConfig(req)

      const lostBedCancellation: NewLostBedCancellation = {
        ...req.body,
      }

      try {
        await this.lostBedsService.cancel(callConfig, premisesId, lostBedId, lostBedCancellation)

        req.flash('success', 'Void booking cancelled')
        res.redirect(paths.lostBeds.show({ premisesId, roomId, lostBedId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.lostBeds.cancellations.new({ premisesId, roomId, lostBedId }),
        )
      }
    }
  }
}
