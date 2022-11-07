import roomFactory from '../testutils/factories/room'
import newRoomFactory from '../testutils/factories/newRoom'
import RoomClient from '../data/roomClient'
import BedspaceService from './bedspaceService'
import ReferenceDataClient from '../data/referenceDataClient'
import characteristicFactory from '../testutils/factories/characteristic'
import { formatLines } from '../utils/viewUtils'
import { formatCharacteristics, filterAndSortCharacteristics } from '../utils/characteristicUtils'

jest.mock('../data/roomClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/viewUtils')
jest.mock('../utils/characteristicUtils')

describe('BedspaceService', () => {
  const roomClient = new RoomClient(null) as jest.Mocked<RoomClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const roomClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new BedspaceService(roomClientFactory, referenceDataClientFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    roomClientFactory.mockReturnValue(roomClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getRoomDetails', () => {
    it('returns a list of rooms and a summary list for each room, for the given premises ID', async () => {
      const room1 = roomFactory.build({
        name: 'XYX',
        characteristics: [
          characteristicFactory.build({ name: 'Characteristic 1' }),
          characteristicFactory.build({ name: 'Characteristic 2' }),
        ],
        notes: 'Some notes',
      })

      const room2 = roomFactory.build({
        name: 'ABC',
        characteristics: [characteristicFactory.build({ name: 'Characteristic 3' })],
        notes: 'Some more notes',
      })

      roomClient.all.mockResolvedValue([room1, room2])
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(formatCharacteristics as jest.MockedFunction<typeof formatCharacteristics>).mockImplementation(() => ({
        text: 'Some attributes',
      }))

      const result = await service.getRoomDetails(token, premisesId)

      expect(result).toEqual([
        {
          room: room2,
          summaryList: {
            rows: [
              {
                key: { text: 'Attributes' },
                value: { text: 'Some attributes' },
              },
              {
                key: { text: 'Notes' },
                value: { html: room2.notes },
              },
            ],
          },
        },
        {
          room: room1,
          summaryList: {
            rows: [
              {
                key: { text: 'Attributes' },
                value: { text: 'Some attributes' },
              },
              {
                key: { text: 'Notes' },
                value: { html: room1.notes },
              },
            ],
          },
        },
      ])

      expect(roomClientFactory).toHaveBeenCalledWith(token)
      expect(roomClient.all).toHaveBeenCalledWith(premisesId)

      expect(formatLines).toHaveBeenCalledWith('Some more notes')
      expect(formatLines).toHaveBeenCalledWith('Some notes')

      expect(formatCharacteristics).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Characteristic 1',
        }),
        expect.objectContaining({
          name: 'Characteristic 2',
        }),
      ])
      expect(formatCharacteristics).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Characteristic 3',
        }),
      ])
    })
  })

  describe('createRoom', () => {
    it('on success returns the room that has been created', async () => {
      const room = roomFactory.build()
      const newRoom = newRoomFactory.build({
        ...room,
      })
      roomClient.create.mockResolvedValue(room)

      const postedRoom = await service.createRoom(token, premisesId, newRoom)
      expect(postedRoom).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(token)
      expect(roomClient.create).toHaveBeenCalledWith(premisesId, newRoom)
    })
  })

  describe('updateRoom', () => {
    it('on success updates the room and returns the updated room', async () => {
      const room = roomFactory.build()
      const newRoom = newRoomFactory.build({
        ...room,
      })
      roomClient.update.mockResolvedValue(room)

      const updatedRoom = await service.updateRoom(token, premisesId, room.id, newRoom)
      expect(updatedRoom).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(token)
      expect(roomClient.update).toHaveBeenCalledWith(premisesId, room.id, newRoom)
    })
  })

  describe('getRoomCharacteristics', () => {
    it('returns prepared room characteristics', async () => {
      const roomCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'room' })
      const roomCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'room' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const otherCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'other' })

      referenceDataClient.getReferenceData.mockResolvedValue([
        genericCharacteristic,
        roomCharacteristic2,
        roomCharacteristic1,
        otherCharacteristic,
      ])
      ;(filterAndSortCharacteristics as jest.MockedFunction<typeof filterAndSortCharacteristics>).mockReturnValue([
        roomCharacteristic1,
        roomCharacteristic2,
        genericCharacteristic,
      ])

      const result = await service.getRoomCharacteristics(token)
      expect(result).toEqual([roomCharacteristic1, roomCharacteristic2, genericCharacteristic])

      expect(filterAndSortCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, roomCharacteristic2, roomCharacteristic1, otherCharacteristic],
        'room',
      )
    })
  })
})
