import type { Request, Response, RequestHandler } from 'express'

import type { NewExtension } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, ExtensionService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'

export default class ExtensionsController {
  constructor(private readonly bookingsService: BookingService, private readonly extensionService: ExtensionService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const { token } = req.user

      const { booking, summaryList } = await this.bookingsService.getBookingDetails(token, premisesId, bookingId)

      return res.render('temporary-accommodation/extensions/new', {
        booking,
        summaryList,
        roomId,
        premisesId,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const { token } = req.user

      const newExtension: NewExtension = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        await this.extensionService.createExtension(token, premisesId, bookingId, newExtension)

        req.flash('success', 'Booking departure date changed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'newDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.bookings.extensions.new({ premisesId, roomId, bookingId }))
      }
    }
  }
}
