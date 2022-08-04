import type { Response, Request, RequestHandler } from 'express'
import type { Departure, DepartureDto } from 'approved-premises'

import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import DepartureService from '../services/departureService'
import PremisesService from '../services/premisesService'
import BookingService from '../services/bookingService'

export default class DeparturesController {
  constructor(
    private readonly departureService: DepartureService,
    private readonly premisesService: PremisesService,
    private readonly bookingService: BookingService,
  ) {}

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

      const { id } = await this.departureService.createDeparture(premisesId, bookingId, departure)

      return res.redirect(`/premises/${premisesId}/bookings/${bookingId}/departures/${id}/confirmation`)
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId, departureId } = req.params

      const booking = await this.bookingService.getBooking(premisesId, bookingId)
      const departure = await this.departureService.getDeparture(premisesId, bookingId, departureId)

      return res.render(`departures/confirm`, {
        ...departure,
        name: booking.name,
        CRN: booking.CRN,
      })
    }
  }
}
