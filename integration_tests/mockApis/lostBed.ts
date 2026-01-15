import { SuperAgentRequest } from 'superagent'

import type { Cas3VoidBedspace, Cas3VoidBedspaceCancellation } from '@approved-premises/api'

import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import { lostBedReasons } from '../../server/testutils/stubs/referenceDataStubs'
import { bedspaceConflictResponseBody, errorStub } from './utils'

export default {
  stubLostBedCreate: (args: { premisesId: string; lostBed: Cas3VoidBedspace }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.voidBedspaces.create({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubSingleLostBed: (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.cas3.premises.voidBedspaces.show({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedsForPremisesId: (args: { premisesId: string; lostBeds: Array<Cas3VoidBedspace> }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.cas3.premises.voidBedspaces.index({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(args.lostBeds),
      },
    }),

  stubLostBedErrors: (args: { premisesId: string; bedspaceId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.voidBedspaces.create({ premisesId: args.premisesId, bedspaceId: args.bedspaceId }),
        'POST',
      ),
    ),

  stubLostBedCreateConflictError: (args: {
    premisesId: string
    bedspaceId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.voidBedspaces.create({ premisesId: args.premisesId, bedspaceId: args.bedspaceId }),
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),

  stubLostBedUpdate: (args: { premisesId: string; lostBed: Cas3VoidBedspace }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.cas3.premises.voidBedspaces.update({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
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
    lostBed: Cas3VoidBedspace
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.voidBedspaces.update({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
        'PUT',
      ),
    ),

  stubLostBedCancel: (args: {
    premisesId: string
    lostBed: Cas3VoidBedspace
    lostBedCancellation: Cas3VoidBedspaceCancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.cas3.premises.voidBedspaces.cancel({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
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

  verifyLostBedCreate: async (args: { premisesId: string; bedspaceId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.voidBedspaces.create({ premisesId: args.premisesId, bedspaceId: args.bedspaceId }),
      })
    ).body.requests,

  verifyLostBedUpdate: async (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.cas3.premises.voidBedspaces.update({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
      })
    ).body.requests,

  verifyLostBedCancel: async (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.cas3.premises.voidBedspaces.cancel({
          premisesId: args.premisesId,
          bedspaceId: args.lostBed.bedspaceId,
          voidBedspaceId: args.lostBed.id,
        }),
      })
    ).body.requests,
}
