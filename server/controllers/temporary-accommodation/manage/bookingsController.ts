import type { Request, RequestHandler, Response } from 'express'

import type { NewBooking } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PersonService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { bookingActions, deriveBookingHistory, generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import {
  catchValidationErrorOrPropogate,
  clearUserInput,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
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
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      return res.render('temporary-accommodation/bookings/new', {
        premises,
        room,
        errors,
        errorSummary,
        errorTitle,
        ...req.query,
      })
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params

      const crn: string = req.query.crn as string

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const backLink = appendQueryString(paths.bookings.new({ premisesId: premises.id, roomId: room.id }), req.query)

      try {
        const person = await this.personsService.findByCrn(callConfig, crn)


        return res.render('temporary-accommodation/bookings/confirm', {
          premises,
          room,
          person,
          ...req.query,
          backLink,
        })
      } catch (err) {
        if (err.status === 404) {
          insertGenericError(err, 'crn', 'doesNotExist')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        return catchValidationErrorOrPropogate(req, res, err, backLink)
      }
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const callConfig = extractCallConfig(req)

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')

      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const newBooking: NewBooking = {
        service: 'temporary-accommodation',
        ...req.body,
        arrivalDate,
        departureDate,
      }

      try {
        const booking = await this.bookingsService.createForBedspace(callConfig, premisesId, room, newBooking)

        req.flash('success', 'Booking created')
        clearUserInput(req)

        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, roomId, 'plural'))
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'departureDate', 'conflict')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          appendQueryString(paths.bookings.new({ premisesId, roomId }), req.body),
        )
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
