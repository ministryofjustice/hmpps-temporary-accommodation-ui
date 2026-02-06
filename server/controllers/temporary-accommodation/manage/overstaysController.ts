import { Request, RequestHandler, Response } from 'express'
import { NewOverstay } from '@approved-premises/api'
import { format as urlFormat } from 'url'
import config from '../../../config'
import { BookingService, DepartureService, OverstaysService, PremisesService } from '../../../services'
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
    private readonly departureService: DepartureService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      if (!config.flags.bookingOverstayEnabled) {
        return res.redirect(paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId }))
      }

      const [premises, bedspace, booking] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.bookingsService.getBooking(callConfig, premisesId, bookingId),
      ])

      const { newDepartureDate } = req.query

      const nights = nightsBetween(booking.arrivalDate, newDepartureDate as string)
      const nightsOverLimit = nights - 84

      const numberOfNights = `${nightsOverLimit} ${nightsOverLimit === 1 ? 'night' : 'nights'}`

      let title: string
      let question: string

      const { departure } = req.session

      if (departure === undefined) {
        title = `The new departure date means the booking is ${numberOfNights} over the limit`
        question = 'Is this an authorised overstay?'
      } else {
        title = `The departure date means the booking was overstayed by ${numberOfNights}`
        question = 'Was this an authorised overstay?'
      }

      return res.render('temporary-accommodation/overstays/new', {
        premises,
        booking,
        bedspace,
        newDepartureDate,
        nightsOverLimit,
        title,
        question,
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

      if (!config.flags.bookingOverstayEnabled) {
        return res.redirect(paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId }))
      }

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

      let redirectUrl = this.getOverstayUrl(premisesId, bedspaceId, bookingId, req.body.newDepartureDate)
      let successMessage = 'Booking departure date changed'

      try {
        const { departure } = req.session

        await this.overstaysService.createOverstay(callConfig, premisesId, bookingId, newOverstay)

        if (departure !== undefined) {
          // redirectUrl is used in the catch block, ignore any IDE warnings about it being unused
          redirectUrl = req.session.previousPage
          successMessage = 'Booking marked as departed'
          await this.departureService.createDeparture(callConfig, premisesId, bookingId, departure)
          req.session.departure = undefined
          req.session.previousPage = undefined
        }

        req.flash('success', successMessage)
        return res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          redirectUrl = paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId })
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
