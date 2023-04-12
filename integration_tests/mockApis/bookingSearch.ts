import { SuperAgentRequest } from 'superagent'
import type { BookingSearchResults, BookingStatus } from '@approved-premises/api'
import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'

export default {
  stubFindBookings: (args: { bookings: BookingSearchResults; status: BookingStatus }): SuperAgentRequest =>
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
}
