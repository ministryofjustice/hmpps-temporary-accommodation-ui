import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResults } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'

export default {
  stubFindBookings: (args: { bookings: BookingSearchResults; status: BookingSearchApiStatus }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.bookings.search({})}?status=${args.status}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.bookings,
      },
    }),
  stubFindBookingsByCRN: (args: {
    bookings: BookingSearchResults
    status: BookingSearchApiStatus
    crn: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.bookings.search({})}?status=${args.status}&crn=${args.crn}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.bookings,
      },
    }),
}
