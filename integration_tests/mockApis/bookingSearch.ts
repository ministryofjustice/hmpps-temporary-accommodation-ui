import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResult, BookingSearchResults } from '@approved-premises/api'
import type { BookingSearchApiStatus, PaginatedResponse } from '@approved-premises/ui'
import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import { setupBookingStateStubs } from '../../cypress_shared/utils/booking'

export default {
  stubFindBookings: (args: { bookings: BookingSearchResult[]; status: BookingSearchApiStatus }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.bookings.search({})}?status=${args.status}&page=1&sortField=endDate&sortOrder=descending`,
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
    }),
  stubFindBookingsByCRN: (args: {
    bookings: BookingSearchResult[]
    status: BookingSearchApiStatus
    crn: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.bookings.search({})}?status=${args.status}&crn=${
          args.crn
        }&page=1&sortField=endDate&sortOrder=descending`,
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
    }),
}
