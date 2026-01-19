import { Request, RequestHandler, Response } from 'express'
import { NewOverstay } from '@approved-premises/api'
import { format as urlFormat } from 'url'
import { BookingService, OverstaysService, PremisesService } from '../../../services'
import {
  addValidationErrorsAndRedirect,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import extractCallConfig from '../../../utils/restUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import { nightsBetween } from '../../../utils/dateUtils'
import BedspaceService from '../../../services/bedspaceService'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'

export default class OverstaysController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly overstaysService: OverstaysService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const [premises, bedspace, booking] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.bookingsService.getBooking(callConfig, premisesId, bookingId),
      ])

      const { newDepartureDate } = req.query

      const nights = nightsBetween(booking.arrivalDate, newDepartureDate as string)
      const nightsOverLimit = nights - 84

      const title = `The new departure date means the booking is ${nightsOverLimit} ${nightsOverLimit === 1 ? 'night' : 'nights'} over the limit`

      return res.render('temporary-accommodation/overstays/new', {
        premises,
        booking,
        bedspace,
        newDepartureDate,
        nightsOverLimit,
        title,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      if (req.body.isAuthorised === undefined) {
        const errors: Record<string, string> = { isAuthorised: 'You must confirm whether the overstay is authorised' }
        const redirectUrl = this.getOverstayUrl(premisesId, bedspaceId, bookingId, req.body.newDepartureDate)
        return addValidationErrorsAndRedirect(req, res, errors, redirectUrl)
      }

      const newOverstay: NewOverstay = {
        newDepartureDate: req.body.newDepartureDate,
        isAuthorised: req.body.isAuthorised === 'yes',
      }

      if (req.body.reason) {
        newOverstay.reason = req.body.reason
      }

      try {
        await this.overstaysService.createOverstay(callConfig, premisesId, bookingId, newOverstay)

        req.flash('success', 'Booking departure date changed')
        return res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        const redirectUrl =
          err.status === 409
            ? paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId })
            : this.getOverstayUrl(premisesId, bedspaceId, bookingId, req.body.newDepartureDate)

        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'singular'))
          insertGenericError(err, 'newDepartureDate', 'conflict')
        }

        return catchValidationErrorOrPropogate(req, res, err, redirectUrl)
      }
    }
  }

  private getOverstayUrl(premisesId: string, bedspaceId: string, bookingId: string, newDepartureDate: string): string {
    return urlFormat({
      pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
      query: { newDepartureDate },
    })
  }
}
