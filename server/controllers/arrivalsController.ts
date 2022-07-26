import type { Response, Request, RequestHandler } from 'express'
import type { Arrival, ArrivalDto } from 'approved-premises'

import { convertDateInputsToDateObj } from '../utils/utils'
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

      const arrival: Omit<Arrival, 'id' | 'bookingId'> = {
        ...body,
        ...convertDateInputsToDateObj(body, 'dateTime'),
        ...convertDateInputsToDateObj(body, 'expectedDeparture'),
      }

      this.arrivalService.createArrival(premisesId, bookingId, arrival)

      res.redirect(`/premises/${premisesId}`)
    }
  }
}
