import { SuperAgentRequest } from 'superagent'

import type { Turnaround } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { bedspaceConflictResponseBody, errorStub } from '../../wiremock/utils'

export default {
  stubTurnaroundUpdate: (args: { premisesId: string; bookingId: string; turnaround: Turnaround }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.turnaround,
      },
    }),
  stubTurnaroundUpdateErrors: (args: {
    premisesId: string
    bookingId: string
    params: Array<string>
  }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`, 'PUT')),
  stubTurnaroundUpdateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'PUT',
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
  verifyTurnaroundUpdate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/turnarounds`,
      })
    ).body.requests,
}
