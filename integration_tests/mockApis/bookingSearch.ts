import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResult } from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchParameters } from '@approved-premises/ui'
import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import { appendQueryString } from '../../server/utils/utils'

export default {
  stubFindBookings: (args: {
    bookings: BookingSearchResult[]
    status: BookingSearchApiStatus
    params?: BookingSearchParameters
  }): SuperAgentRequest => {
    const url = appendQueryString(paths.bookings.search({}), {
      status: args.status,
      crn: args.params?.crn,
      page: args.params?.page || 1,
      sortField: args.params?.sortBy || 'endDate',
      sortOrder: args.params?.sortDirection === 'asc' ? 'ascending' : 'descending',
    })

    return stubFor({
      request: {
        method: 'GET',
        url,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          results: args.bookings,
          resultsCount: args.bookings.length,
        },
      },
    })
  },
}
