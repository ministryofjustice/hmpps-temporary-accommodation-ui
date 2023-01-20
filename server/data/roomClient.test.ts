import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import roomFactory from '../testutils/factories/room'
import newRoomFactory from '../testutils/factories/newRoom'
import updateRoomFactory from '../testutils/factories/updateRoom'
import RoomClient from './roomClient'
import { createMockRequest } from '../testutils/createMockRequest'

describe('Room Client', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let roomClient: RoomClient

  const request = createMockRequest()
  const premisesId = 'premisesId'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    roomClient = new RoomClient(request)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('all', () => {
    it('should get all rooms for the given premises', async () => {
      const rooms = roomFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.premises.rooms.index({ premisesId }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, rooms)

      const output = await roomClient.all(premisesId)
      expect(output).toEqual(rooms)
    })
  })

  describe('find', () => {
    it('should get a single premises', async () => {
      const room = roomFactory.build()

      fakeApprovedPremisesApi
        .get(paths.premises.rooms.show({ premisesId, roomId: room.id }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, room)

      const output = await roomClient.find(premisesId, room.id)
      expect(output).toEqual(room)
    })
  })

  describe('create', () => {
    it('should return the room that has been created', async () => {
      const room = roomFactory.build()

      const payload = newRoomFactory.build({
        name: room.name,
        notes: room.notes,
      })

      fakeApprovedPremisesApi
        .post(paths.premises.rooms.create({ premisesId }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, room)

      const output = await roomClient.create(premisesId, payload)
      expect(output).toEqual(room)
    })
  })

  describe('update', () => {
    it('updates the given room and returns the updated room', async () => {
      const room = roomFactory.build()
      const payload = updateRoomFactory.build({
        ...room,
      })

      fakeApprovedPremisesApi
        .put(paths.premises.rooms.update({ premisesId, roomId: room.id }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, room)

      const output = await roomClient.update(premisesId, room.id, payload)
      expect(output).toEqual(room)
    })
  })
})
