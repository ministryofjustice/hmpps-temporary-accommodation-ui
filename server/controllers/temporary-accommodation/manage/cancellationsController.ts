import type { Request, Response, RequestHandler } from 'express'

import type { NewCancellation } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, CancellationService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'

export default class CanellationsController {
  constructor(
    private readonly bookingsService: BookingService,
    private readonly cancellationService: CancellationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)
      const { cancellationReasons: allCancellationReasons } = await this.cancellationService.getReferenceData(
        callConfig,
      )

      return res.render('temporary-accommodation/cancellations/new', {
        booking,
        roomId,
        premisesId,
        allCancellationReasons,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'date'),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newCancellation: NewCancellation = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'date'),
      }

      try {
        await this.cancellationService.createCancellation(callConfig, premisesId, bookingId, newCancellation)

        req.flash('success', 'Booking cancelled')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.cancellations.new({ premisesId, roomId, bookingId }),
          'bookingCancellation',
        )
      }
    }
  }
}
