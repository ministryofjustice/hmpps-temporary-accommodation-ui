import type { Request, Response, RequestHandler } from 'express'

import PremisesService from '../services/premisesService'
import BookingService from '../services/bookingService'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService, private readonly bookingService: BookingService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.withTokenFromRequest(req).tableRows()
      return res.render('premises/index', { tableRows })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.withTokenFromRequest(req).getPremisesDetails(req.params.id)

      const bookingService = this.bookingService.withTokenFromRequest(req)
      const bookings = await bookingService.groupedListOfBookingsForPremisesId(req.params.id)
      const currentResidents = await bookingService.currentResidents(req.params.id)

      return res.render('premises/show', { premises, bookings, currentResidents })
    }
  }
}
