import { SuperAgentRequest } from 'superagent'

import type { TemporaryAccommodationLostBed as LostBed } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'
import { lostBedReasons } from '../../wiremock/referenceDataStubs'
import paths from '../../server/paths/api'

export default {
  stubLostBedCreate: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubSingleLostBed: (args: { premisesId: string; lostBed: LostBed }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.premises.lostBeds.show({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedsForPremisesId: (args: { premisesId: string; lostBeds: Array<LostBed> }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.premises.lostBeds.index({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(args.lostBeds),
      },
    }),

  stubLostBedErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/lost-beds`, 'POST')),

  stubLostBedCreateConflictError: (premisesId: string) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${premisesId}/lost-beds`,
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

  stubLostBedReferenceData: () => stubFor(lostBedReasons),

  verifyLostBedCreate: async (args: { premisesId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
      })
    ).body.requests,
}
