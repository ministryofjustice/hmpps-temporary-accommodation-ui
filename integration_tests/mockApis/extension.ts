import { SuperAgentRequest } from 'superagent'

import type { Extension } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

export default {
  stubExtensionCreate: (args: { premisesId: string; bookingId: string; extension: Extension }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/extensions`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.extension,
      },
    }),
  stubExtensionCreateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/extensions`, 'POST')),
  stubExtensionCreateConflictError: (args: { premisesId: string; bookingId: string }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/extensions`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: {
          title: 'Conflict',
          status: 409,
        },
      },
    }),
  verifyExtensionCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/extensions`,
      })
    ).body.requests,
}
