import type { Response, SuperAgentRequest } from 'superagent'

import type { Departure } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'
import { departureReasons, moveOnCategories } from '../../server/testutils/stubs/referenceDataStubs'

export default {
  stubDepartureGet: (args: { premisesId: string; bookingId: string; departure: Departure }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/departures/${args.departure.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.departure,
      },
    }),
  stubDepartureCreate: (args: { premisesId: string; bookingId: string; departure: Departure }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.departure,
      },
    }),
  stubDepartureCreateErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/departures`, 'POST')),
  stubDepartureReferenceData: (): Promise<[Response, Response]> =>
    Promise.all([stubFor(departureReasons), stubFor(moveOnCategories)]),
  verifyDepartureCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/cas3/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      })
    ).body.requests,
}
