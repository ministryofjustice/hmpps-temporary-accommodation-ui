import { SuperAgentRequest } from 'superagent'

import type { Arrival } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'

export default {
  stubArrivalCreate: (args: { premisesId: string; bookingId: string; arrival: Arrival }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.arrival,
      },
    }),
  verifyArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`,
      })
    ).body.requests,
}
