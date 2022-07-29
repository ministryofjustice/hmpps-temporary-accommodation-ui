import { Response, Request, RequestHandler } from 'express'
import type { NonArrival, NonArrivalDto } from 'approved-premises'
import { convertDateInputsToIsoString } from '../utils/utils'
import NonArrivalService from '../services/nonArrivalService'

export default class NonArrivalsController {
  constructor(private readonly nonArrivalService: NonArrivalService) {}

  create(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as NonArrivalDto
      const { nonArrivalDate } = convertDateInputsToIsoString(body, 'nonArrivalDate')

      const nonArrival: Omit<NonArrival, 'id' | 'bookingId'> = {
        ...body.nonArrival,
        date: nonArrivalDate,
      }

      this.nonArrivalService.createNonArrival(premisesId, bookingId, nonArrival)

      res.redirect(`/premises/${premisesId}`)
    }
  }
}
