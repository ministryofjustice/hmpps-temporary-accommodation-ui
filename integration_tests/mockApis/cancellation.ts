import type { SuperAgentRequest } from 'superagent'
import type { Cancellation } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

import { cancellationReasons } from '../../wiremock/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),
  stubCancellationCreate: (args: {
    premisesId: string
    bookingId: string
    cancellation: Cancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.cancellation,
      },
    }),
  verifyCancellationCreate: async (args: { premisesId: string; bookingId: string; cancellation: Cancellation }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`,
      })
    ).body.requests,
}
