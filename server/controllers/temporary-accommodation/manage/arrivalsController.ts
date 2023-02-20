import type { Request, RequestHandler, Response } from 'express'

import type { NewArrival } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BookingService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'

export default class ArrivalsController {
  constructor(private readonly bookingsService: BookingService, private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/arrivals/new', {
        booking,
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
      const callConfig = extractCallConfig(req)

      const newArrival: NewArrival = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
      }

      try {
        await this.arrivalService.createArrival(callConfig, premisesId, bookingId, newArrival)

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
