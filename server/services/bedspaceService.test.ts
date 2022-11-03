import roomFactory from '../testutils/factories/room'
import newRoomFactory from '../testutils/factories/newRoom'
import RoomClient from '../data/roomClient'
import BedspaceService from './bedspaceService'
import ReferenceDataClient from '../data/referenceDataClient'
import characteristicFactory from '../testutils/factories/characteristic'
import { escape, formatLines } from '../utils/viewUtils'
import { filterAndSortCharacteristics } from '../utils/characteristicUtils'

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
      const roomWithCharacteristics = roomFactory.build({
        name: 'XYX',
        characteristics: [characteristicFactory.build({ name: 'HIJ' }), characteristicFactory.build({ name: 'EFG' })],
        notes: 'Some notes',
      })

      const roomWithoutCharacteristics = roomFactory.build({
        name: 'ABC',
        characteristics: [],
        notes: 'Some more notes',
      })

      roomClient.all.mockResolvedValue([roomWithCharacteristics, roomWithoutCharacteristics])
      ;(escape as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatLines as jest.MockedFunction<typeof escape>).mockImplementation(text => text)

      const result = await service.getRoomDetails(token, premisesId)

      expect(result).toEqual([
        {
          room: roomWithoutCharacteristics,
          summaryList: {
            rows: [
              {
                key: { text: 'Attributes' },
                value: { text: '' },
              },
              {
                key: { text: 'Notes' },
                value: { html: roomWithoutCharacteristics.notes },
              },
            ],
          },
        },
        {
          room: roomWithCharacteristics,
          summaryList: {
            rows: [
              {
                key: { text: 'Attributes' },
                value: { html: '<ul><li>EFG</li><li>HIJ</li></ul>' },
              },
              {
                key: { text: 'Notes' },
                value: { html: roomWithCharacteristics.notes },
              },
            ],
          },
        },
      ])

      expect(roomClientFactory).toHaveBeenCalledWith(token)
      expect(roomClient.all).toHaveBeenCalledWith(premisesId)

      expect(formatLines).toHaveBeenCalledWith('Some more notes')

      expect(formatLines).toHaveBeenCalledWith('Some notes')
      expect(escape).toHaveBeenCalledWith('EFG')
      expect(escape).toHaveBeenCalledWith('HIJ')
    })
  })

  describe('createRoom', () => {
    it('on success returns the room that has been created', async () => {
      const room = roomFactory.build()
      const newRoom = newRoomFactory.build({
        name: room.name,
        notes: room.notes,
      })
      roomClient.create.mockResolvedValue(room)

      const postedRoom = await service.createRoom(token, premisesId, newRoom)
      expect(postedRoom).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(token)
      expect(roomClient.create).toHaveBeenCalledWith(premisesId, newRoom)
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
