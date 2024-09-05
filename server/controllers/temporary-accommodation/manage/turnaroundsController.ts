import type { Request, RequestHandler, Response } from 'express'

import type { NewTurnaround } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, PremisesService, TurnaroundService } from '../../../services'
import { generateTurnaroundConflictBespokeError } from '../../../utils/bookingUtils'
import { parseIntegerNumber } from '../../../utils/formUtils'
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
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspaceService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/turnarounds/new', {
        premises,
        room,
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
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newTurnaround: NewTurnaround = {
        ...req.body,
        workingDays: parseIntegerNumber(req.body.workingDays),
      }

      try {
        await this.turnaroundService.createTurnaround(callConfig, premisesId, bookingId, newTurnaround)

        req.flash('success', 'Turnaround time changed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateTurnaroundConflictBespokeError(err, premisesId, roomId))
          insertGenericError(err, 'workingDays', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.turnarounds.new({ premisesId, roomId, bookingId }),
        )
      }
    }
  }
}
