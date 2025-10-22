import type { Request, RequestHandler, Response } from 'express'
import type { NewCancellation } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, CancellationService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class CancellationsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly cancellationService: CancellationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { cancellationReasons: allCancellationReasons } =
        await this.cancellationService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/cancellations/new', {
        premises,
        bedspace,
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
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newCancellation: NewCancellation = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'date'),
      }

      try {
        await this.cancellationService.createCancellation(callConfig, premisesId, bookingId, newCancellation)

        req.flash('success', 'Booking cancelled')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.cancellations.new({ premisesId, bedspaceId, bookingId }),
          'bookingCancellation',
        )
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { cancellationReasons: allCancellationReasons } =
        await this.cancellationService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/cancellations/edit', {
        premises,
        bedspace,
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
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newCancellation: NewCancellation = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'date'),
      }

      try {
        await this.cancellationService.createCancellation(callConfig, premisesId, bookingId, newCancellation)

        req.flash('success', 'Cancelled booking updated')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.cancellations.edit({ premisesId, bedspaceId, bookingId }),
          'bookingCancellation',
        )
      }
    }
  }
}
