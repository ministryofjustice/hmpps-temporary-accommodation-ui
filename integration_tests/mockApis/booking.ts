import type { Cas3Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody } from './utils'
import paths from '../../server/paths/api'

export default {
  stubBookingCreate: (args: { premisesId: string; booking: Cas3Booking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
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
        url: paths.cas3.premises.bookings.create({ premisesId: args.premisesId }),
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
        url: paths.cas3.premises.bookings.show({ premisesId: args.premisesId, bookingId: args.booking.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  stubBookingsForPremisesId: (args: { premisesId: string; bookings: Array<Cas3Booking> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.cas3.premises.bookings.create({ premisesId: args.premisesId }),
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
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.create({ premisesId }),
      })
    ).body.requests,
}
