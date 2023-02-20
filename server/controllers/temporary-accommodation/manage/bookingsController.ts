import type { Request, RequestHandler, Response } from 'express'

import type { NewBooking } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import { DateFormats } from '../../../utils/dateUtils'
import { bookingActions, deriveBookingHistory } from '../../../utils/bookingUtils'
import extractCallConfig from '../../../utils/restUtils'

export default class BookingsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      return res.render('temporary-accommodation/bookings/new', {
        premises,
        room,
        errors,
        errorSummary: requestErrorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const callConfig = extractCallConfig(req)

      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const newBooking: NewBooking = {
        service: 'temporary-accommodation',
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'departureDate'),
      }

      try {
        const booking = await this.bookingsService.createForBedspace(callConfig, premisesId, room, newBooking)

        req.flash('success', 'Booking created')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'departureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(req, res, err, paths.bookings.new({ premisesId, roomId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/bookings/show', {
        premises,
        room,
        booking,
        actions: bookingActions(premisesId, roomId, booking),
      })
    }
  }

  history(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/bookings/history', {
        premises,
        room,
        booking,
        history: deriveBookingHistory(booking).map(({ booking: historicBooking, updatedAt }) => ({
          booking: historicBooking,
          updatedAt: DateFormats.isoDateToUIDate(updatedAt, { format: 'short' }),
        })),
      })
    }
  }
}
