import type { Booking, BookingStatus, Cas3Booking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { bedspaceConflictResponseBody } from './utils'
import paths from '../../server/paths/api'
import config from '../../server/config'

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utility.
//  The codebase now uses the 'Cas3Booking' type all around, but the API should still be returning responses based on the
//  type 'Booking' when the flag is off, so we force a transform here to make things simpler.
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

const cas3v2ApiEnabledStubs = {
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

const cas3v2ApiDisabledStubs = {
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

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
