import type { BookingDto } from 'approved-premises'
import type { Request, Response, RequestHandler } from 'express'

import BookingService from '../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'

export default class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.getBooking(req.user.token, premisesId, bookingId)

      return res.render(`bookings/show`, { booking, premisesId })
    }
  }

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render(`bookings/new`, { premisesId, errors, errorSummary, ...userInput })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const booking: BookingDto = {
        ...req.body,
        ...convertDateAndTimeInputsToIsoString(req.body, 'expectedArrivalDate'),
        ...convertDateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
      }

      try {
        const confirmedBooking = await this.bookingService.postBooking(req.user.token, premisesId as string, booking)

        res.redirect(`/premises/${premisesId}/bookings/${confirmedBooking.id}/confirmation`)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, `/premises/${premisesId}/bookings/new`)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.getBooking(req.user.token, premisesId, bookingId)

      return res.render('bookings/confirm', booking)
    }
  }
}
