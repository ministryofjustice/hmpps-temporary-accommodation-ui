import type { Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { bedspaceConflictResponseBody, errorStub } from '../../wiremock/utils'

export default {
  stubBookingCreate: (args: { premisesId: string; booking: Booking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  stubBookingCreateErrors: (args: { premisesId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings`, 'POST')),
  stubBookingCreateApiError: (args: { premisesId: string; errorCode: number; errorTitle: string }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: args.errorCode,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: {
          title: args.errorTitle,
          status: args.errorCode,
        },
      },
    }),
  stubBookingCreateConflictError: (args: {
    premisesId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  stubBooking: (args: { premisesId: string; booking: Booking }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/bookings/${args.booking.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  stubBookingsForPremisesId: (args: { premisesId: string; bookings: Array<Booking> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(args.bookings),
      },
    }),
  verifyBookingCreate: async (premisesId: string) =>
    (await getMatchingRequests({ method: 'POST', url: `/premises/${premisesId}/bookings` })).body.requests,
}
