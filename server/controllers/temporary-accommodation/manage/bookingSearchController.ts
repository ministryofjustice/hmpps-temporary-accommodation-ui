import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import type { BookingSearchApiStatus, BookingSearchParameters } from '@approved-premises/ui'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSubNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const params = req.query as BookingSearchParameters

      const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(callConfig, status, params)

      return res.render(`temporary-accommodation/booking-search/results`, {
        uiStatus: convertApiStatusToUiStatus(status),
        subNavArr: createSubNavArr(status),
        tableHeadings: createTableHeadings(status),
        bookingTableRows,
        crn: params.crn,
      })
    }
  }
}
