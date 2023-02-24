import type { NewDeparture } from '@approved-premises/api'
import type { Request, RequestHandler, Response } from 'express'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService } from '../../../services'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class DeparturesController {
  constructor(private readonly bookingsService: BookingService, private readonly departureService: DepartureService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)
      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(callConfig)

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
      const callConfig = extractCallConfig(req)

      const newDeparture: NewDeparture = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
        await this.departureService.createDeparture(callConfig, premisesId, bookingId, newDeparture)

        req.flash('success', 'Booking marked as closed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.departures.new({ premisesId, roomId, bookingId }))
      }
    }
  }
}
