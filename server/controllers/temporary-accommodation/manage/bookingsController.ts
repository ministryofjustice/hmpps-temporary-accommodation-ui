import type { Request, RequestHandler, Response } from 'express'

import type { NewBooking } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PersonService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { bookingActions, deriveBookingHistory } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertGenericError,
  setUserInput,
} from '../../../utils/validation'

export default class BookingsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly personsService: PersonService,
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

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const { crn } = req.body

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      try {
        const person = await this.personsService.findByCrn(callConfig, crn)

        setUserInput(req)

        return res.render('temporary-accommodation/bookings/confirm', {
          premises,
          room,
          person,
          arrivalDate,
          departureDate,
        })
      } catch (err) {
        if (err.status === 404) {
          insertGenericError(err, 'crn', 'doesNotExist')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        )
      }
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
      }

      try {
        const booking = await this.bookingsService.createForBedspace(callConfig, premisesId, room, newBooking)

        req.flash('success', 'Booking created')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
      } catch (err) {
        if (err.status === 409) {
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'departureDate', 'conflict')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
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
