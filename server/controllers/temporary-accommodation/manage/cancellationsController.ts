import type { NewCancellation } from '@approved-premises/api'
import type { Request, RequestHandler, Response } from 'express'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, CancellationService, PremisesService } from '../../../services'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class CanellationsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly cancellationService: CancellationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { cancellationReasons: allCancellationReasons } = await this.cancellationService.getReferenceData(
        callConfig,
      )

      return res.render('temporary-accommodation/cancellations/new', {
        premises,
        room,
        booking,
        allCancellationReasons,
        errors,
        errorSummary: requestErrorSummary,
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
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'date'),
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

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { cancellationReasons: allCancellationReasons } = await this.cancellationService.getReferenceData(
        callConfig,
      )

      return res.render('temporary-accommodation/cancellations/edit', {
        premises,
        room,
        booking,
        allCancellationReasons,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.isoToDateAndTimeInputs(booking.cancellation.date, 'date'),
        reason: booking.cancellation.reason.id,
        notes: booking.cancellation.notes,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newCancellation: NewCancellation = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'date'),
      }

      try {
        await this.cancellationService.createCancellation(callConfig, premisesId, bookingId, newCancellation)

        req.flash('success', 'Cancelled booking updated')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.cancellations.edit({ premisesId, roomId, bookingId }),
          'bookingCancellation',
        )
      }
    }
  }
}
