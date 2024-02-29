import type { Request, RequestHandler, Response } from 'express'
import { BookingSearchService } from 'server/services'
import type { BookingSearchApiStatus, BookingSearchParameters } from '@approved-premises/ui'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSubNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import paths from '../../../paths/temporary-accommodation/manage'

export default class BookingSearchController {
  constructor(private readonly bookingSearchService: BookingSearchService) {}

  index(status: BookingSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const params = req.query as BookingSearchParameters

      try {
        if (params.crn !== undefined && !params.crn.trim().length) {
          const error = new Error()
          insertGenericError(error, 'crn', 'empty')
          throw error
        }

        const bookingTableRows = await this.bookingSearchService.getTableRowsForFindBooking(callConfig, status, params)

        return res.render(`temporary-accommodation/booking-search/results`, {
          uiStatus: convertApiStatusToUiStatus(status),
          subNavArr: createSubNavArr(status),
          tableHeadings: createTableHeadings(status),
          bookingTableRows,
          crn: params.crn,
          errors,
          errorSummary,
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
