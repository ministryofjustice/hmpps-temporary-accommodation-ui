import type { Response, Request, RequestHandler } from 'express'
import type { Departure, DepartureDto } from 'approved-premises'

import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import DepartureService from '../services/departureService'

export default class DeparturesController {
  constructor(private readonly departureService: DepartureService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.getBooking(premisesId, bookingId)

      res.render('departures/new', { premisesId, booking, premisesSelectList })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as DepartureDto
      const { dateTime } = convertDateAndTimeInputsToIsoString(body, 'dateTime')

      const departure: Omit<Departure, 'id' | 'bookingId'> = {
        ...body.departure,
        dateTime,
      }

      await this.departureService.createDeparture(premisesId, bookingId, departure)

      res.redirect(`/premises/${premisesId}`)
    }
  }
}
