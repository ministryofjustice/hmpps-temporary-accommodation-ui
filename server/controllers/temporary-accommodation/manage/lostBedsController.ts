import type { Request, RequestHandler, Response } from 'express'

import type { NewTemporaryAccommodationLostBed as NewLostBed } from '@approved-premises/api'
import { LostBedService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import extractCallConfig from '../../../utils/restUtils'
import { DateFormats } from '../../../utils/dateUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { allStatuses } from '../../../utils/lostBedUtils'

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
        allStatuses,
      })
    }
  }
}
