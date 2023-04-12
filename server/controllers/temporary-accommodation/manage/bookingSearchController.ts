import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(callConfig, status)

      const uiStatus = convertApiStatusToUiStatus(status)

      return res.render(`temporary-accommodation/booking-search/results`, {
        uiStatus,
        sideNavArr: createSideNavArr(uiStatus),
        tableHeadings: createTableHeadings(uiStatus),
        bookingTableRows,
      })
    }
  }
}
