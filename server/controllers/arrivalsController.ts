import type { Response, Request, RequestHandler } from 'express'

import ArrivalService from '../services/arrivalService'

export default class ArrivalsController {
  constructor(private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      res.render('arrivals/new', { premisesId, bookingId })
    }
  }
}
