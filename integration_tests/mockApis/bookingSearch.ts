import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResult, Cas3BookingSearchResult } from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchParameters, PaginatedResponse } from '@approved-premises/ui'
import paths from '../../server/paths/api'
import { stubFor } from '.'
import { appendQueryString } from '../../server/utils/utils'

export type MockPagination = Pick<
  PaginatedResponse<BookingSearchResult>,
  'totalResults' | 'totalPages' | 'pageNumber' | 'pageSize'
>

export default {
  stubFindBookings: (args: {
    bookings: Cas3BookingSearchResult[]
    status: BookingSearchApiStatus
    params?: BookingSearchParameters
    pagination?: MockPagination
  }): SuperAgentRequest => {
    const url = appendQueryString(paths.cas3.bookings.search({}), {
      status: args.status,
      crnOrName: args.params?.crnOrName,
      page: args.params?.page || 1,
      sortField: args.params?.sortBy || 'endDate',
      sortDirection: args.params?.sortDirection || 'desc',
    })

    const paginationHeaders = {
      'x-pagination-currentpage': args.pagination?.pageNumber.toString(),
      'x-pagination-pagesize': args.pagination?.pageSize.toString(),
      'x-pagination-totalpages': args.pagination?.totalPages.toString(),
      'x-pagination-totalresults': args.pagination?.totalResults.toString(),
    }

    return stubFor({
      request: {
        method: 'GET',
        url,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ...paginationHeaders,
        },
        jsonBody: {
          results: args.bookings,
          resultsCount: args.bookings.length,
        },
      },
    })
  },
}
