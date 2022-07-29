import { SuperAgentRequest } from 'superagent'

import type { NonArrival } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'

export default {
  stubNonArrivalCreate: (args: { premisesId: string; bookingId: string; nonArrival: NonArrival }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.nonArrival,
      },
    }),
  verifyNonArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`,
      })
    ).body.requests,
}
