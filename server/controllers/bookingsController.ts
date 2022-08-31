import type { NewBooking } from 'approved-premises'
import type { Request, Response, RequestHandler } from 'express'

import BookingService from '../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import paths from '../paths'

export default class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render(`bookings/show`, { booking, premisesId, pageHeading: 'Booking details' })
    }
  }

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render(`bookings/new`, {
        premisesId,
        errors,
        errorSummary,
        pageHeading: 'Make a booking',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const booking: NewBooking = {
        ...req.body,
        ...convertDateAndTimeInputsToIsoString(req.body, 'expectedArrivalDate'),
        ...convertDateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
      }

      try {
        const confirmedBooking = await this.bookingService.create(req.user.token, premisesId as string, booking)

        res.redirect(
          paths.bookings.confirm({
            premisesId,
            bookingId: confirmedBooking.id,
          }),
        )
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.new({
            premisesId,
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render('bookings/confirm', { premisesId, bookingId, pageHeading: 'Booking complete', ...booking })
    }
  }
}
