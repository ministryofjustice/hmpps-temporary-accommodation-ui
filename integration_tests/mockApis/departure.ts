import type { SuperAgentRequest, Response } from 'superagent'

import type { Departure } from '@approved-premises/api'

import { stubFor, getMatchingRequests } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'
import { departureReasons, moveOnCategories, destinationProviders } from '../../wiremock/referenceDataStubs'

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
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.departure,
      },
    }),
  stubDepartureErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/departures`)),
  stubDepartureReferenceData: (): Promise<[Response, Response, Response]> =>
    Promise.all([stubFor(departureReasons), stubFor(moveOnCategories), stubFor(destinationProviders)]),
  verifyDepartureCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/departures`,
      })
    ).body.requests,
}
