import type { Booking, BookingStatus, Cas3Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody, errorStub } from './utils'

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utility.
//  The codebase now uses the 'Cas3Booking' type all around, but the API should still be returning responses based on the
//  type 'Booking', so we force a transform here to make things simpler.
const cas3BookingToBooking = (booking: Cas3Booking): Booking => {
  const { bedspace, status, ...sharedProperties } = booking

  return {
    ...sharedProperties,
    bed: {
      id: bedspace.id,
      name: bedspace.reference,
    },
    status: status as BookingStatus,
    serviceName: 'temporary-accommodation',
  }
}

export default {
  stubBookingCreate: (args: { premisesId: string; booking: Cas3Booking }) =>
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
        jsonBody: cas3BookingToBooking(args.booking),
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
    conflictingEntityType: 'booking' | 'lost-bed' | 'bedspace-end-date'
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
  stubBooking: (args: { premisesId: string; booking: Cas3Booking }) =>
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
        jsonBody: cas3BookingToBooking(args.booking),
      },
    }),
  stubBookingsForPremisesId: (args: { premisesId: string; bookings: Array<Cas3Booking> }) =>
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
        body: JSON.stringify(args.bookings.map(cas3BookingToBooking)),
      },
    }),
  verifyBookingCreate: async (premisesId: string) =>
    (await getMatchingRequests({ method: 'POST', url: `/premises/${premisesId}/bookings` })).body.requests,
}
