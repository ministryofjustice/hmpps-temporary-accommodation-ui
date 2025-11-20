import type { SuperAgentRequest } from 'superagent'
import type { Cas3Confirmation } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import paths from '../../server/paths/api'

export default {
  stubConfirmationCreate: (args: {
    premisesId: string
    bookingId: string
    confirmation: Cas3Confirmation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.confirmations({ premisesId: args.premisesId, bookingId: args.bookingId }),
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
        url: paths.cas3.premises.bookings.confirmations({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}
