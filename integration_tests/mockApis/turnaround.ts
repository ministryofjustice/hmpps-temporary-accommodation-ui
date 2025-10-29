import { SuperAgentRequest } from 'superagent'

import type { Turnaround } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
  stubTurnaroundCreate: (args: { premisesId: string; bookingId: string; turnaround: Turnaround }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.turnarounds({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.turnaround,
      },
    }),
  stubTurnaroundCreateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.bookings.turnarounds({ premisesId: args.premisesId, bookingId: args.bookingId }),
        'POST',
      ),
    ),
  stubTurnaroundCreateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.turnarounds({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  verifyTurnaroundCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.turnarounds({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}

const cas3v2ApiDisabledStubs = {
  stubTurnaroundCreate: (args: { premisesId: string; bookingId: string; turnaround: Turnaround }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.turnaround,
      },
    }),
  stubTurnaroundCreateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`, 'POST')),
  stubTurnaroundCreateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  verifyTurnaroundCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`,
      })
    ).body.requests,
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
