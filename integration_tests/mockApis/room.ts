import { SuperAgentRequest } from 'superagent'
import { Room } from '@approved-premises/api'
import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { characteristics } from '../../wiremock/referenceDataStubs'
import { errorStub } from '../../wiremock/utils'
import booking from './booking'
import lostBed from './lostBed'

export default {
  stubRoomsForPremisesId: (args: { premisesId: string; rooms: Array<Room> }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.premises.rooms.index({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.rooms,
      },
    }),
  stubSingleRoom: (args: { premisesId: string; room: Room }) =>
    Promise.all([
      stubFor({
        request: {
          method: 'GET',
          urlPath: paths.premises.rooms.show({ premisesId: args.premisesId, roomId: args.room.id }),
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: args.room,
        },
      }),
      booking.stubBookingsForPremisesId({ premisesId: args.premisesId, bookings: [] }),
      lostBed.stubLostBedsForPremisesId({ premisesId: args.premisesId, lostBeds: [] }),
    ]),
  stubRoomCreate: (args: { premisesId: string; room: Room }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.rooms.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.room,
      },
    }),
  verifyRoomCreate: async (premisesId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.rooms.create({ premisesId }),
      })
    ).body.requests,
  stubRoomCreateErrors: (args: {
    premisesId: string
    errors: Array<{ field: keyof Room; type?: string }>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.rooms.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 400,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': args.errors.map(error => ({
            propertyName: `$.${error.field}`,
            errorType: error.type || 'empty',
          })),
        },
      },
    }),
  stubRoomUpdate: (args: { premisesId: string; room: Room }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.rooms.update({ premisesId: args.premisesId, roomId: args.room.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.room,
      },
    }),
  stubRoomUpdateConflictError: (args: { premisesId: string; room: Room; detail: string }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.rooms.update({ premisesId: args.premisesId, roomId: args.room.id }),
      },
      response: {
        status: 409,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          title: 'Conflict',
          status: 409,
          detail: args.detail,
        },
      },
    }),
  verifyRoomUpdate: async (args: { premisesId: string; room: Room }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.rooms.update({ premisesId: args.premisesId, roomId: args.room.id }),
      })
    ).body.requests,
  stubRoomReferenceData: () => stubFor(characteristics),
}
