import { Request, RequestHandler, Response } from 'express'
import { BookingService, OverstaysService, PremisesService } from '../../../services'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'
import extractCallConfig from '../../../utils/restUtils'
import { NewOverstay } from '../../../data/bookingClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { nightsBetween } from '../../../utils/dateUtils'
import BedspaceService from '../../../services/bedspaceService'

export default class OverstaysController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly overstaysService: OverstaysService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
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

      return res.render('temporary-accommodation/overstays/new', {
        premises,
        booking,
        bedspace,
        newDepartureDate,
        nightsOverLimit,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

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
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
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
