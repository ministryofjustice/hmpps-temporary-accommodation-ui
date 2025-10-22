import type { Request, RequestHandler, Response } from 'express'

import type { NewExtension } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, ExtensionService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
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
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/extensions/new', {
        premises,
        bedspace,
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
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newExtension: NewExtension = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        await this.extensionService.createExtension(callConfig, premisesId, bookingId, newExtension)

        req.flash('success', 'Booking departure date changed')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'singular'))
          insertGenericError(err, 'newDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }
}
