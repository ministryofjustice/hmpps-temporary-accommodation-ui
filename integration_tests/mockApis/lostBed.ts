import { SuperAgentRequest } from 'superagent'

import type { Cas3VoidBedspace, Cas3VoidBedspaceCancellation, LostBed, LostBedReason } from '@approved-premises/api'

import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import { lostBedReasons } from '../../server/testutils/stubs/referenceDataStubs'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import config from '../../server/config'

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utility.
//  The codebase now uses the 'Cas3VoidBedspace' types all around, but the API should still be returning responses
//  based on the type 'LostBed' when the flag is off, so we force a transform here to make things simpler.
const cas3VoidBedspaceToLostBed = (lostBed: Cas3VoidBedspace): LostBed => {
  const { bedspaceId, bedspaceName, reason, cancellationNotes, cancellationDate, ...sharedProperties } = lostBed

  return {
    ...sharedProperties,
    cancellation: {
      id: 'cancellation-id',
      createdAt: cancellationDate,
      notes: cancellationNotes,
    },
    bedId: bedspaceId,
    bedName: bedspaceName,
    roomName: bedspaceName,
    reason: reason as LostBedReason,
  }
}

const cas3v2ApiEnabledStubs = {
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

const cas3v2ApiDisabledStubs = {
  stubLostBedCreate: (args: { premisesId: string; lostBed: Cas3VoidBedspace }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: cas3VoidBedspaceToLostBed(args.lostBed),
      },
    }),

  stubSingleLostBed: (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
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
        jsonBody: cas3VoidBedspaceToLostBed(args.lostBed),
      },
    }),

  stubLostBedsForPremisesId: (args: { premisesId: string; lostBeds: Array<Cas3VoidBedspace> }) =>
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
        body: JSON.stringify(args.lostBeds.map(cas3VoidBedspaceToLostBed)),
      },
    }),

  stubLostBedErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, paths.premises.lostBeds.create({ premisesId: args.premisesId }), 'POST')),

  stubLostBedCreateConflictError: (args: {
    premisesId: string
    bedspaceId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
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
        url: paths.premises.lostBeds.update({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cas3VoidBedspaceToLostBed(args.lostBed),
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
        paths.premises.lostBeds.update({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
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
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
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
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      })
    ).body.requests,

  verifyLostBedUpdate: async (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.lostBeds.update({
          premisesId: args.premisesId,
          lostBedId: args.lostBed.id,
        }),
      })
    ).body.requests,

  verifyLostBedCancel: async (args: { premisesId: string; lostBed: Cas3VoidBedspace }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, lostBedId: args.lostBed.id }),
      })
    ).body.requests,
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
