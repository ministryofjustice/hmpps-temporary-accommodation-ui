import { SuperAgentRequest } from 'superagent'

import type { Cas3NonArrival } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'

export default {
  stubNonArrivalCreate: (args: {
    premisesId: string
    bookingId: string
    nonArrival: Cas3NonArrival
  }): SuperAgentRequest =>
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
  stubNonArrivalErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`, 'POST')),
  verifyNonArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`,
      })
    ).body.requests,
}
