import type { Request, Response, RequestHandler } from 'express'

import type { NewDeparture } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'

export default class DeparturesController {
  constructor(private readonly bookingsService: BookingService, private readonly departureService: DepartureService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const { token } = req.user

      const booking = await this.bookingsService.getBooking(token, premisesId, bookingId)
      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(token)

      return res.render('temporary-accommodation/departures/new', {
        booking,
        roomId,
        premisesId,
        allDepartureReasons,
        allMoveOnCategories,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'dateTime'),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const { token } = req.user

      const newDeparture: NewDeparture = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
        await this.departureService.createDeparture(token, premisesId, bookingId, newDeparture)

        req.flash('success', 'Booking marked as closed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.departures.new({ premisesId, roomId, bookingId }))
      }
    }
  }
}
