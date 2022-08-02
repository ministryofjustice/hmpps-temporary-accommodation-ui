import type { Response, Request, RequestHandler } from 'express'
import type { Arrival, ArrivalDto } from 'approved-premises'

import { convertDateInputsToIsoString } from '../utils/utils'
import ArrivalService from '../services/arrivalService'

export default class ArrivalsController {
  constructor(private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      res.render('arrivals/new', { premisesId, bookingId })
    }
  }

  create(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as ArrivalDto

      const { date } = convertDateInputsToIsoString(body, 'date')
      const { expectedDepartureDate } = convertDateInputsToIsoString(body, 'expectedDepartureDate')

      const arrival: Omit<Arrival, 'id' | 'bookingId'> = {
        ...body.arrival,
        date,
        expectedDepartureDate,
      }

      this.arrivalService.createArrival(premisesId, bookingId, arrival)

      res.redirect(`/premises/${premisesId}`)
    }
  }
}
