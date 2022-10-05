import type { Response, SuperAgentRequest } from 'superagent'

import type { Premises, Booking, DateCapacity, StaffMember } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import bookingStubs from './booking'

const stubPremises = (premises: Array<Premises>) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/premises',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
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

const stubPremisesCapacity = (args: { premisesId: string; dateCapacities: DateCapacity }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/premises/${args.premisesId}/capacity`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.dateCapacities,
    },
  })

export default {
  stubPremises,
  stubSinglePremises: (premises: Premises): Promise<[Response, Response]> =>
    Promise.all([
      stubSinglePremises(premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: premises.id, bookings: [] }),
    ]),
  stubPremisesWithBookings: (args: { premises: Premises; bookings: Array<Booking> }): Promise<[Response, Response]> =>
    Promise.all([
      stubSinglePremises(args.premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: args.premises.id, bookings: args.bookings }),
    ]),
  stubPremisesCapacity,
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
  verifyPremisesCreate: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises`,
      })
    ).body.requests,
}
