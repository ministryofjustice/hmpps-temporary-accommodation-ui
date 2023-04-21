import { SuperAgentRequest } from 'superagent'

import type { LostBed, LostBedCancellation } from '@approved-premises/api'

import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { lostBedReasons } from '../../wiremock/referenceDataStubs'
import { errorStub } from '../../wiremock/utils'

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
    stubFor(errorStub(args.params, paths.premises.lostBeds.create({ premisesId: args.premisesId }), 'POST')),

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

  stubLostBedUpdate: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.lostBeds.update({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedUpdateErrors: (args: {
    premisesId: string
    lostBedId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(
      errorStub(
        args.params,
        paths.premises.lostBeds.update({ premisesId: args.premisesId, lostBedId: args.lostBedId }),
        'PUT',
      ),
    ),

  stubLostBedCancel: (args: {
    premisesId: string
    lostBedId: string
    lostBedCancellation: LostBedCancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, lostBedId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.lostBedCancellation,
      },
    }),

  stubLostBedReferenceData: () => stubFor(lostBedReasons),

  verifyLostBedCreate: async (args: { premisesId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      })
    ).body.requests,

  verifyLostBedUpdate: async (args: { premisesId: string; lostBedId: string }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.lostBeds.update({
          premisesId: args.premisesId,
          lostBedId: args.lostBedId,
        }),
      })
    ).body.requests,

  verifyLostBedCancel: async (args: { premisesId: string; lostBedId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, lostBedId: args.lostBedId }),
      })
    ).body.requests,
}
