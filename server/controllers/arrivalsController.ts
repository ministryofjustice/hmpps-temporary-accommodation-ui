import type { Response, Request, RequestHandler } from 'express'
import type { Arrival, ArrivalDto } from 'approved-premises'

import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import ArrivalService from '../services/arrivalService'
import renderWithErrors from '../utils/renderWithErrors'

export default class ArrivalsController {
  constructor(private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      res.render('arrivals/new', { premisesId, bookingId })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as ArrivalDto

      const { date } = convertDateAndTimeInputsToIsoString(body, 'date')
      const { expectedDepartureDate } = convertDateAndTimeInputsToIsoString(body, 'expectedDepartureDate')

      const arrival: Omit<Arrival, 'id' | 'bookingId'> = {
        ...body.arrival,
        date,
        expectedDepartureDate,
      }

      try {
        await this.arrivalService.createArrival(premisesId, bookingId, arrival)

        res.redirect(`/premises/${premisesId}`)
      } catch (err) {
        renderWithErrors(req, res, err, `arrivals/new`, { premisesId, bookingId, arrived: true })
      }
    }
  }
}
