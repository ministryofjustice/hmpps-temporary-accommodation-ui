import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import type { BookingSearchStatus } from '@approved-premises/api'
import extractCallConfig from '../../../utils/restUtils'
import { createSideNavArr } from '../../../utils/bookingSearchUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(callConfig, status)

      const sideNavArr = createSideNavArr(status)

      return res.render(`temporary-accommodation/booking-search/${status}`, { sideNavArr, bookingTableRows })
    }
  }
}