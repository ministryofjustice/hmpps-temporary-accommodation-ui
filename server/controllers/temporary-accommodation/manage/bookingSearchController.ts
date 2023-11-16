import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import { BookingSearchSortField } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const page = req.query.page ? Number(req.query.page) : null
      const sortBy = req.query.sortBy as BookingSearchSortField

      const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(
        callConfig,
        status,
        page,
        sortBy,
      )

      return res.render(`temporary-accommodation/booking-search/results`, {
        uiStatus: convertApiStatusToUiStatus(status),
        sideNavArr: createSideNavArr(status),
        tableHeadings: createTableHeadings(status),
        bookingTableRows,
      })
    }
  }
}
