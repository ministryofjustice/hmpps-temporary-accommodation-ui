import type { Response, SuperAgentRequest } from 'superagent'

import type { Cas3Departure, Departure } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'
import { departureReasons, moveOnCategories } from '../../server/testutils/stubs/referenceDataStubs'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
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

const cas3v2ApiDisabledStubs = {
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

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
