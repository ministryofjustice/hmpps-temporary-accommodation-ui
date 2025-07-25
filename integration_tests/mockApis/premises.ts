import type { Response, SuperAgentRequest } from 'superagent'

import type {
  Booking,
  Premises,
  Cas3PremisesSummary as PremisesSummary,
  Room,
  StaffMember,
} from '@approved-premises/api'

import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import {
  characteristics,
  localAuthorities,
  pdus,
  probationRegions,
} from '../../server/testutils/stubs/referenceDataStubs'
import { errorStub } from './utils'
import bookingStubs from './booking'
import roomStubs from './room'

type SearchArguments = {
  premisesSummaries: Array<PremisesSummary>
  postcode: string
}

const stubPremises = (premisesSummaries: Array<PremisesSummary>) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/cas3/premises/summary',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premisesSummaries,
    },
  })

const stubPremisesSearch = (args: SearchArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/cas3/premises/summary',
      queryParameters: {
        postcodeOrAddress: {
          equalTo: args.postcode,
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.premisesSummaries,
    },
  })

const stubSinglePremises = (premises: Premises) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/premises/${premises.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })

export default {
  stubPremises,
  stubPremisesSearch,
  stubSinglePremises: (premises: Premises): Promise<[Response, Response, Response]> =>
    Promise.all([
      stubSinglePremises(premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: premises.id, bookings: [] }),
      roomStubs.stubRoomsForPremisesId({ premisesId: premises.id, rooms: [] }),
    ]),
  stubPremisesWithBookings: (args: { premises: Premises; bookings: Array<Booking> }): Promise<[Response, Response]> =>
    Promise.all([
      stubSinglePremises(args.premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: args.premises.id, bookings: args.bookings }),
    ]),
  stubPremisesWithRooms: (args: { premises: Premises; rooms: Array<Room> }): Promise<[Response, Response]> =>
    Promise.all([
      stubSinglePremises(args.premises),
      roomStubs.stubRoomsForPremisesId({ premisesId: args.premises.id, rooms: args.rooms }),
    ]),
  stubPremisesStaff: (args: { premisesId: string; staff: Array<StaffMember> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/staff`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.staff,
      },
    }),
  stubPremisesCreate: (premises: Premises): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: premises,
      },
    }),
  stubPremisesCreateErrors: (params: Array<string>): SuperAgentRequest =>
    stubFor(errorStub(params, '/premises', 'POST')),
  verifyPremisesCreate: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises`,
      })
    ).body.requests,
  stubPremisesUpdate: (premises: Premises): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.update({ premisesId: premises.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: premises,
      },
    }),
  stubPremisesUpdateErrors: (args: { premises: Premises; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, paths.premises.update({ premisesId: args.premises.id }), 'PUT')),
  verifyPremisesUpdate: async (premises: Premises) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.update({ premisesId: premises.id }),
      })
    ).body.requests,
  stubPremisesReferenceData: (): Promise<[Response, Response, Response, Response]> =>
    Promise.all([stubFor(localAuthorities), stubFor(characteristics), stubFor(probationRegions), stubFor(pdus)]),
}
