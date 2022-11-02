import roomFactory from '../testutils/factories/room'
import newRoomFactory from '../testutils/factories/newRoom'
import RoomClient from '../data/roomClient'
import BedspaceService from './bedspaceService'
import ReferenceDataClient from '../data/referenceDataClient'
import characteristic from '../testutils/factories/characteristic'

jest.mock('../data/roomClient')
jest.mock('../data/referenceDataClient')

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
    it('returns room characteristics, sorted alphabetically', async () => {
      const roomCharacteristic1 = characteristic.build({ name: 'XYZ', modelScope: 'room' })
      const roomCharacteristic2 = characteristic.build({ name: 'ABC', modelScope: 'room' })
      const genericCharacteristic = characteristic.build({ name: 'EFG', modelScope: '*' })
      const otherCharacteristic = characteristic.build({ name: 'RST', modelScope: 'other' })

      referenceDataClient.getReferenceData.mockResolvedValue([
        roomCharacteristic1,
        roomCharacteristic2,
        genericCharacteristic,
        otherCharacteristic,
      ])

      const result = await service.getRoomCharacteristics(token)
      expect(result).toEqual([roomCharacteristic2, genericCharacteristic, roomCharacteristic1])
    })
  })
})
