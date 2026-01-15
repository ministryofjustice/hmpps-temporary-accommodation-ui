import { SuperAgentRequest } from 'superagent'

import type { Cas3Turnaround } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import paths from '../../server/paths/api'

export default {
  stubTurnaroundCreate: (args: {
    premisesId: string
    bookingId: string
    turnaround: Cas3Turnaround
  }): SuperAgentRequest =>
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
