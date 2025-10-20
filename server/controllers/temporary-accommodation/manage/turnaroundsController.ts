import type { Request, RequestHandler, Response } from 'express'

import type { NewTurnaround } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService, TurnaroundService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { generateTurnaroundConflictBespokeError } from '../../../utils/bookingUtils'
import { parseNumber } from '../../../utils/formUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'

export default class TurnaroundsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingService: BookingService,
    private readonly turnaroundService: TurnaroundService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/turnarounds/new', {
        premises,
        bedspace,
        booking,
        errors,
        errorSummary,
        errorTitle,
        workingDays: `${booking.turnaround?.workingDays || 0}`,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newTurnaround: NewTurnaround = {
        ...req.body,
        workingDays: parseNumber(req.body.workingDays, { allowNegatives: true }),
      }

      try {
        await this.turnaroundService.createTurnaround(callConfig, premisesId, bookingId, newTurnaround)

        req.flash('success', 'Turnaround time changed')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateTurnaroundConflictBespokeError(err, premisesId, bedspaceId))
          insertGenericError(err, 'workingDays', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.turnarounds.new({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }
}
