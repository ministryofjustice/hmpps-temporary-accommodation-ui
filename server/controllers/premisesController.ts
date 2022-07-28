import type { Request, Response, RequestHandler, ShowRequest, ShowRequestHandler } from 'express'

import PremisesService from '../services/premisesService'
import BookingService from '../services/bookingService'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService, private readonly bookingService: BookingService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows()
      return res.render('premises/index', { tableRows })
    }
  }

  show(): ShowRequestHandler {
    return async (req: ShowRequest, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.params.id)
      const bookings = await this.bookingService.groupedListOfBookingsForPremisesId(req.params.id)
      return res.render('premises/show', { premises, bookings })
    }
  }
}
