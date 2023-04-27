import { SuperAgentRequest } from 'superagent'

import type { Turnaround } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { bedspaceConflictResponseBody, errorStub } from '../../wiremock/utils'

export default {
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
