import type { Request, RequestHandler, Response } from 'express'

import type { NewCas3Arrival as NewArrival } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BedspaceService, BookingService, PremisesService } from '../../../services'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'

export default class ArrivalsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly arrivalService: ArrivalService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/arrivals/new', {
        premises,
        room,
        booking,
        errors,
        errorSummary,
        errorTitle,
        ...DateFormats.isoToDateAndTimeInputs(booking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'expectedDepartureDate'),
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
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
        type: 'CAS3',
      }

      try {
        await this.arrivalService.createArrival(callConfig, premisesId, bookingId, newArrival)

        req.flash('success', 'Booking marked as active')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, roomId, 'plural'))
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'expectedDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.bookings.arrivals.new({ premisesId, roomId, bookingId }))
      }
    }
  }
}
