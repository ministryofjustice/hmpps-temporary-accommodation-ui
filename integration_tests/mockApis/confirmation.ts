import type { SuperAgentRequest } from 'superagent'
import type { Confirmation } from '@approved-premises/api'

import { stubFor, getMatchingRequests } from '../../wiremock'

export default {
  stubConfirmationCreate: (args: {
    premisesId: string
    bookingId: string
    confirmation: Confirmation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/confirmations`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.confirmation,
      },
    }),
  verifyConfirmationCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/confirmations`,
      })
    ).body.requests,
}
