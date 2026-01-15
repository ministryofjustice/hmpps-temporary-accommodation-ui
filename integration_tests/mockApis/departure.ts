import type { Response, SuperAgentRequest } from 'superagent'

import type { Cas3Departure } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'
import { departureReasons, moveOnCategories } from '../../server/testutils/stubs/referenceDataStubs'
import paths from '../../server/paths/api'

export default {
  stubDepartureCreate: (args: { premisesId: string; bookingId: string; departure: Cas3Departure }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.departures.create({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.departure,
      },
    }),
  stubDepartureCreateErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.bookings.departures.create({ premisesId: args.premisesId, bookingId: args.bookingId }),
        'POST',
      ),
    ),
  stubDepartureReferenceData: (): Promise<[Response, Response]> =>
    Promise.all([stubFor(departureReasons), stubFor(moveOnCategories)]),
  verifyDepartureCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.departures.create({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}
