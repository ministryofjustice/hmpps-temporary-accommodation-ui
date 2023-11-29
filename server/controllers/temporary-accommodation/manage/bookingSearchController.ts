import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import { BookingSearchSortField, SortDirection } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import extractCallConfig from '../../../utils/restUtils'
import { pagination } from '../../../utils/pagination'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const response = await this.bookingSearchService.getTableRowsForFindBooking(
        callConfig,
        status,
        Number(req.query.page),
        req.query.sortBy as BookingSearchSortField,
        req.query.sortDirection as SortDirection,
      )

      // the params are defaulted downstream, inspect to find out what they are
      const sortBy = response.url.params.get('sortField') as BookingSearchSortField
      const ascending = response.url.params.get('sortOrder') === 'ascending'

      return res.render(`temporary-accommodation/booking-search/results`, {
        uiStatus: convertApiStatusToUiStatus(status),
        sideNavArr: createSideNavArr(status),
        tableHeadings: createTableHeadings(status, sortBy, ascending, ''), // dont send the page, will revert to 1 on sort change
        pagination: pagination(
          response.pageNumber,
          response.totalPages,
          `?sortBy=${sortBy}&sortDirection=${ascending ? 'asc' : 'desc'}`,
        ),
        response,
      })
    }
  }
}
