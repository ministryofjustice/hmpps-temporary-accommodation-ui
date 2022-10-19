import type { Request, Response, RequestHandler } from 'express'

import PremisesService from '../../services/premisesService'
import BookingService from '../../services/bookingService'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService, private readonly bookingService: BookingService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.approvedPremisesTableRows(req.user.token)
      return res.render('premises/index', { tableRows })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.user.token, req.params.premisesId)

      const bookings = await this.bookingService.groupedListOfBookingsForPremisesId(
        req.user.token,
        req.params.premisesId,
      )
      const currentResidents = await this.bookingService.currentResidents(req.user.token, req.params.premisesId)
      const overcapacityMessage = await this.premisesService.getOvercapacityMessage(
        req.user.token,
        req.params.premisesId,
      )

      return res.render('premises/show', {
        premises,
        premisesId: req.params.premisesId,
        bookings,
        currentResidents,
        infoMessages: overcapacityMessage,
      })
    }
  }
}
