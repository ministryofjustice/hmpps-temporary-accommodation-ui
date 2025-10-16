import type { Request, RequestHandler, Response } from 'express'

import type { NewConfirmation } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/v2/bedspaceService'
import ConfirmationService from '../../../services/confirmationService'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class ConfirmationsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly confirmationService: ConfirmationService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/confirmations/new', {
        premises,
        bedspace,
        booking,
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

      const newConfirmation: NewConfirmation = {
        ...req.body,
      }

      try {
        await this.confirmationService.createConfirmation(callConfig, premisesId, bookingId, newConfirmation)

        req.flash('success', 'Booking confirmed')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.confirmations.new({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }
}
