import type { Request, Response, RequestHandler } from 'express'

import type { BookingExtension } from 'approved-premises'
import BookingService from '../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'

export default class BookingExtensionsController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.getBooking(req.user.token, premisesId, bookingId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render('bookings/extensions/new', { premisesId, booking, errors, errorSummary, ...userInput })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const bookingExtension: BookingExtension = {
        ...req.body,
        ...convertDateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        const extendedBooking = await this.bookingService.extendBooking(
          req.user.token,
          premisesId,
          bookingId,
          bookingExtension,
        )

        res.redirect(`/premises/${premisesId}/bookings/${extendedBooking.id}/extensions/confirmation`)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, `/premises/${premisesId}/bookings/${bookingId}/extensions/new`)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.getBooking(req.user.token, premisesId, bookingId)

      return res.render('bookings/extensions/confirm', { premisesId, ...booking })
    }
  }
}
