import type { Request, Response, RequestHandler } from 'express'

import type { BookingExtension } from 'approved-premises'
import BookingService from '../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import paths from '../paths'

export default class BookingExtensionsController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
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

        res.redirect(
          paths.bookings.extensions.confirm({
            premisesId,
            bookingId: extendedBooking.id,
          }),
        )
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.extensions.new({
            premisesId,
            bookingId,
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render('bookings/extensions/confirm', { premisesId, ...booking })
    }
  }
}
