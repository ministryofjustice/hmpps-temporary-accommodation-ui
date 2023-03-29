import { SuperAgentRequest } from 'superagent'
import paths from '../../server/paths/api'
import type { BookingSearchResults } from '../../server/@types/shared/models/BookingSearchResults'
import { stubFor } from '../../wiremock'

export default {
  stubFindBookings: (args: { bookings: BookingSearchResults }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.bookings.search({}),
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
