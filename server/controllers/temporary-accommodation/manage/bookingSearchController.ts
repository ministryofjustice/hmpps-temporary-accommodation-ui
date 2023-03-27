import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import extractCallConfig from '../../../utils/restUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(callConfig)

      return res.render('temporary-accommodation/bookingSearch/index', { bookingTableRows })
    }
  }
}
