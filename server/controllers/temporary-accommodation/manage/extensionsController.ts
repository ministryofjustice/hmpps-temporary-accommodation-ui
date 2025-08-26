import type { Request, RequestHandler, Response } from 'express'

import type { NewExtension } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, ExtensionService, PremisesService } from '../../../services'
import { generateConflictBespokeError, getLatestExtension } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'

export default class ExtensionsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly extensionService: ExtensionService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/extensions/new', {
        premises,
        room,
        booking,
        errors,
        errorSummary,
        errorTitle,
        notes: getLatestExtension(booking)?.notes,
        ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newExtension: NewExtension = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        await this.extensionService.createExtension(callConfig, premisesId, bookingId, newExtension)

        req.flash('success', 'Booking departure date changed')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId: roomId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, roomId, 'singular'))
          insertGenericError(err, 'newDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.extensions.new({ premisesId, bedspaceId: roomId, bookingId }),
        )
      }
    }
  }
}
