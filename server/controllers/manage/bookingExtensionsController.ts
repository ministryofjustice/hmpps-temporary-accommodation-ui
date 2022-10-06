import type { Request, Response, RequestHandler } from 'express'

import type { NewBookingExtension } from 'approved-premises'
import BookingService from '../../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

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

      const bookingExtension: NewBookingExtension = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        await this.bookingService.extendBooking(req.user.token, premisesId, bookingId, bookingExtension)

        res.redirect(
          paths.bookings.extensions.confirm({
            premisesId,
            bookingId,
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
