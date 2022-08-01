import { SuperAgentRequest } from 'superagent'

import type { Departure } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'

export default {
  stubDepartureCreate: (args: { premisesId: string; bookingId: string; departure: Departure }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.departure,
      },
    }),
  verifyDepartureCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      })
    ).body.requests,
}
