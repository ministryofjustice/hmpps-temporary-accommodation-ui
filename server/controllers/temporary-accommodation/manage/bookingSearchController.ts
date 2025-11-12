import type { Request, RequestHandler, Response } from 'express'
import type { BookingSearchApiStatus, BookingSearchParameters } from '@approved-premises/ui'
import { BookingSearchService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'
import { pagination } from '../../../utils/pagination'
import { convertApiStatusToUiStatus, createSubNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'
import paths from '../../../paths/temporary-accommodation/manage'
import { appendQueryString } from '../../../utils/utils'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const params = req.query as BookingSearchParameters

      try {
        const response = await this.bookingSearchService.getTableRowsForFindBooking(callConfig, status, params)

        const sortBy = params.sortBy || 'endDate'
        const ascending = params.sortDirection === 'asc'

        return res.render(`temporary-accommodation/booking-search/results`, {
          uiStatus: convertApiStatusToUiStatus(status),
          subNavArr: createSubNavArr(status, params.crnOrName),
          tableHeadings: createTableHeadings(status, sortBy, ascending, appendQueryString('', params)), // dont send the page, will revert to 1 on sort change
          pagination: pagination(response.pageNumber, response.totalPages, appendQueryString('', params)),
          response,
          crnOrName: params.crnOrName,
        })
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.search[convertApiStatusToUiStatus(status)].index(),
        )
      }
    }
  }
}
