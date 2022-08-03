import type { Booking } from 'approved-premises'

import { getMatchingRequests, stubFor } from '../../wiremock'

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
  stubBookingErrors: (args: { premisesId: string; params: Array<string> }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings`,
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: {
          type: 'https://example.net/validation-error',
          title: 'Invalid request parameters',
          code: 400,
          'invalid-params': args.params.map(param => {
            return {
              propertyName: param,
              errorType: 'blank',
            }
          }),
        },
      },
    }),
  stubBookingGet: (args: { premisesId: string; booking: Booking }) =>
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
  verifyBookingCreate: async (args: { premisesId }) =>
    (await getMatchingRequests({ method: 'POST', url: `/premises/${args.premisesId}/bookings` })).body.requests,
}
