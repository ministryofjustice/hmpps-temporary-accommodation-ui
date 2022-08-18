import { Response, Request, RequestHandler } from 'express'
import type { NonArrival, NonArrivalDto } from 'approved-premises'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import NonArrivalService from '../services/nonArrivalService'
import { catchValidationErrorOrPropogate } from '../utils/validation'

export default class NonArrivalsController {
  constructor(private readonly nonArrivalService: NonArrivalService) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as NonArrivalDto
      const { nonArrivalDate } = convertDateAndTimeInputsToIsoString(body, 'nonArrivalDate')

      const nonArrival: Omit<NonArrival, 'id' | 'bookingId'> = {
        ...body.nonArrival,
        date: nonArrivalDate,
      }

      try {
        await this.nonArrivalService.withTokenFromRequest(req).createNonArrival(premisesId, bookingId, nonArrival)

        res.redirect(`/premises/${premisesId}`)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, `/premises/${premisesId}/bookings/${bookingId}/arrivals/new`)
      }
    }
  }
}
