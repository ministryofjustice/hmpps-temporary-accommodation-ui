import { Room } from '@approved-premises/api'
import { SuperAgentRequest } from 'superagent'
import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { characteristics } from '../../wiremock/referenceDataStubs'
import { errorStub } from '../../wiremock/utils'
import booking from './booking'

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
  stubRoomCreateErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, paths.premises.rooms.create({ premisesId: args.premisesId }), 'POST')),
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
  stubRoomUpdateErrors: (args: { premisesId: string; room: Room; params: Array<string> }): SuperAgentRequest =>
    stubFor(
      errorStub(args.params, paths.premises.rooms.update({ premisesId: args.premisesId, roomId: args.room.id }), 'PUT'),
    ),
  verifyRoomUpdate: async (args: { premisesId: string; room: Room }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.rooms.update({ premisesId: args.premisesId, roomId: args.room.id }),
      })
    ).body.requests,
  stubRoomReferenceData: () => stubFor(characteristics),
}
