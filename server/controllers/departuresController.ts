import type { Response, Request, RequestHandler } from 'express'
import type { Departure, DepartureDto } from 'approved-premises'

import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import DepartureService from '../services/departureService'
import PremisesService from '../services/premisesService'

export default class DeparturesController {
  constructor(private readonly departureService: DepartureService, private readonly premisesService: PremisesService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.getBooking(premisesId, bookingId)
      const premisesSelectList = await this.premisesService.getPremisesSelectList()

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
