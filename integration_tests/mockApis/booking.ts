import type { Booking, KeyWorker } from 'approved-premises'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

export default {
  stubKeyWorkers: (args: { keyWorkers: Array<KeyWorker> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: '/reference-data/key-workers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.keyWorkers.map(keyWorker => {
          return { ...keyWorker, isActive: true }
        }),
      },
    }),
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
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings`, ['arrivalDate', 'departureDate'])),
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
