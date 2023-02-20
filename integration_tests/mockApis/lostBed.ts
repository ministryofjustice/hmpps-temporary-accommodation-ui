import { Response, SuperAgentRequest } from 'superagent'

import type { LostBed } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'
import { lostBedReasons } from '../../wiremock/referenceDataStubs'

export default {
  stubLostBedCreate: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/lost-beds`, 'POST')),

  stubLostBedReferenceData: (): Promise<Response> => stubFor(lostBedReasons),

  verifyLostBedCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
      })
    ).body.requests,
}
