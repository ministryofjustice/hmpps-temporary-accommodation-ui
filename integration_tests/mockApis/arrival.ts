import { SuperAgentRequest } from 'superagent'

import type { Arrival, Cas3Arrival } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
  stubArrivalCreate: (args: { premisesId: string; bookingId: string; arrival: Cas3Arrival }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.arrivals({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.arrival,
      },
    }),
  stubArrivalCreateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.bookings.arrivals({ premisesId: args.premisesId, bookingId: args.bookingId }),
        'POST',
      ),
    ),
  stubArrivalCreateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.arrivals({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  verifyArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.arrivals({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}

const cas3v2ApiDisabledStubs = {
  stubArrivalCreate: (args: { premisesId: string; bookingId: string; arrival: Arrival }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.arrival,
      },
    }),
  stubArrivalCreateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`, 'POST')),
  stubArrivalCreateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  verifyArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/arrivals`,
      })
    ).body.requests,
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
