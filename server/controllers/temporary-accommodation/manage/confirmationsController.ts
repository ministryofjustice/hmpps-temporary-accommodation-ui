import type { Request, Response, RequestHandler } from 'express'

import type { NewConfirmation } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import ConfirmationService from '../../../services/confirmationService'
import extractCallConfig from '../../../utils/restUtils'

export default class ConfirmationsController {
  constructor(
    private readonly bookingsService: BookingService,
    private readonly confirmationService: ConfirmationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/confirmations/new', {
        booking,
        roomId,
        premisesId,
        errors,
        errorSummary: requestErrorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newConfirmation: NewConfirmation = {
        ...req.body,
      }

      try {
        await this.confirmationService.createConfirmation(callConfig, premisesId, bookingId, newConfirmation)

        req.flash('success', 'Booking confirmed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.confirmations.new({ premisesId, roomId, bookingId }),
        )
      }
    }
  }
}
