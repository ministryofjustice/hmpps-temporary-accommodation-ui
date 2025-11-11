import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResult, Cas3BookingSearchResult } from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchParameters, PaginatedResponse } from '@approved-premises/ui'
import paths from '../../server/paths/api'
import { stubFor } from '.'
import { appendQueryString } from '../../server/utils/utils'
import config from '../../server/config'
import { searchSortFieldsMap } from '../../server/data/bookingClient'

export type MockPagination = Pick<
  PaginatedResponse<BookingSearchResult>,
  'totalResults' | 'totalPages' | 'pageNumber' | 'pageSize'
>

const cas3v2ApiEnabledStubs = {
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
      sortField: searchSortFieldsMap[args.params?.sortBy] || 'BOOKING_END_DATE',
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

const cas3v2ApiDisabledStubs = {
  stubFindBookings: (args: {
    bookings: Cas3BookingSearchResult[]
    status: BookingSearchApiStatus
    params?: BookingSearchParameters
    pagination?: MockPagination
  }): SuperAgentRequest => {
    const url = appendQueryString(paths.bookings.search({}), {
      status: args.status,
      crnOrName: args.params?.crnOrName,
      page: args.params?.page || 1,
      sortField: args.params?.sortBy || 'endDate',
      sortOrder: args.params?.sortDirection === 'asc' ? 'ascending' : 'descending',
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

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
