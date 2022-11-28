import type { Request, Response, RequestHandler } from 'express'

import type { NewArrival } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BookingService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'

export default class ArrivalsController {
  constructor(private readonly bookingsService: BookingService, private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const { token } = req.user

      const { booking, summaryList } = await this.bookingsService.getBookingDetails(token, premisesId, bookingId)

      return res.render('temporary-accommodation/arrivals/new', {
        booking,
        summaryList,
        roomId,
        premisesId,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'expectedDepartureDate'),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const { token } = req.user

      const newArrival: NewArrival = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
      }

      try {
        await this.arrivalService.createArrival(token, premisesId, bookingId, newArrival)

        req.flash('success', 'Booking marked as active')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'expectedDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.bookings.arrivals.new({ premisesId, roomId, bookingId }))
      }
    }
  }
}
