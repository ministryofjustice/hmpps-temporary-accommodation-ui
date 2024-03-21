import { addDays } from 'date-fns'
import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import RoomClient from '../data/roomClient'
import { bedFactory, characteristicFactory, newRoomFactory, roomFactory } from '../testutils/factories'
import { filterCharacteristics, formatCharacteristics } from '../utils/characteristicUtils'
import { formatLines } from '../utils/viewUtils'
import BedspaceService from './bedspaceService'
import { DateFormats } from '../utils/dateUtils'

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

  const callConfig = { token: 'some-token' } as CallConfig
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    roomClientFactory.mockReturnValue(roomClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getRoom', () => {
    it('returns the room for the given room ID', async () => {
      const room = roomFactory.build()
      roomClient.find.mockResolvedValue(room)

      const result = await service.getRoom(callConfig, premisesId, room.id)

      expect(result).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(callConfig)
      expect(roomClient.find).toHaveBeenCalledWith(premisesId, room.id)
    })
  })

  describe('getBedspaceDetails', () => {
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

      const result = await service.getBedspaceDetails(callConfig, premisesId)

      expect(result).toEqual([
        {
          room: room2,
          summaryList: {
            rows: [
              {
                key: { text: 'Bedspace status' },
                value: { html: '<span class="govuk-tag govuk-tag--green">Online</span>' },
              },
              {
                key: { text: 'Bedspace end date' },
                value: { text: 'No end date added' },
              },
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
                key: { text: 'Bedspace status' },
                value: { html: '<span class="govuk-tag govuk-tag--green">Online</span>' },
              },
              {
                key: { text: 'Bedspace end date' },
                value: { text: 'No end date added' },
              },
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

      expect(roomClientFactory).toHaveBeenCalledWith(callConfig)
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

  describe('getSingleBedspaceDetails', () => {
    it('returns a room and a summary list, for the given premises ID and room ID', async () => {
      const bedEndDate = DateFormats.dateObjToIsoDate(addDays(new Date(), -14))
      const room = roomFactory.build({
        characteristics: [
          characteristicFactory.build({ name: 'Characteristic 1' }),
          characteristicFactory.build({ name: 'Characteristic 2' }),
        ],
        notes: 'Some notes',
        beds: [bedFactory.build({ bedEndDate })],
      })

      roomClient.find.mockResolvedValue(room)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(formatCharacteristics as jest.MockedFunction<typeof formatCharacteristics>).mockImplementation(() => ({
        text: 'Some attributes',
      }))

      const result = await service.getSingleBedspaceDetails(callConfig, premisesId, room.id)

      expect(result).toEqual({
        room,
        summaryList: {
          rows: [
            {
              key: { text: 'Bedspace status' },
              value: { html: `<span class="govuk-tag govuk-tag--grey">Archived</span>` },
            },
            {
              key: { text: 'Bedspace end date' },
              value: { text: DateFormats.isoDateToUIDate(bedEndDate) },
            },
            {
              key: { text: 'Attributes' },
              value: { text: 'Some attributes' },
            },
            {
              key: { text: 'Notes' },
              value: { html: room.notes },
            },
          ],
        },
      })

      expect(roomClientFactory).toHaveBeenCalledWith(callConfig)
      expect(roomClient.find).toHaveBeenCalledWith(premisesId, room.id)

      expect(formatLines).toHaveBeenCalledWith('Some notes')

      expect(formatCharacteristics).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Characteristic 1',
        }),
        expect.objectContaining({
          name: 'Characteristic 2',
        }),
      ])
    })
  })

  describe('getUpdateRoom', () => {
    it('finds the room given by the room ID, and returns the room as an UpdatePremises', async () => {
      const room = roomFactory.build({
        characteristics: [
          characteristicFactory.build({
            name: 'Characteristic A',
            id: 'characteristic-a',
          }),
          characteristicFactory.build({
            name: 'Characteristic B',
            id: 'characteristic-b',
          }),
        ],
      })

      roomClient.find.mockResolvedValue(room)

      const result = await service.getUpdateRoom(callConfig, premisesId, room.id)
      expect(result).toEqual({
        ...room,
        characteristicIds: ['characteristic-a', 'characteristic-b'],
      })

      expect(roomClient.find).toHaveBeenCalledWith(premisesId, room.id)
    })
  })

  describe('createRoom', () => {
    it('on success returns the room that has been created', async () => {
      const room = roomFactory.build()
      const newRoom = newRoomFactory.build({
        ...room,
      })
      roomClient.create.mockResolvedValue(room)

      const postedRoom = await service.createRoom(callConfig, premisesId, newRoom)
      expect(postedRoom).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(callConfig)
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

      const updatedRoom = await service.updateRoom(callConfig, premisesId, room.id, newRoom)
      expect(updatedRoom).toEqual(room)

      expect(roomClientFactory).toHaveBeenCalledWith(callConfig)
      expect(roomClient.update).toHaveBeenCalledWith(premisesId, room.id, newRoom)
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted room characteristics', async () => {
      const roomCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'room' })
      const roomCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'room' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const premisesCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'premises' })

      referenceDataClient.getReferenceData.mockResolvedValue([
        genericCharacteristic,
        roomCharacteristic2,
        roomCharacteristic1,
        premisesCharacteristic,
      ])
      ;(filterCharacteristics as jest.MockedFunction<typeof filterCharacteristics>).mockReturnValue([
        roomCharacteristic2,
        genericCharacteristic,
        roomCharacteristic1,
      ])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({ characteristics: [roomCharacteristic1, roomCharacteristic2, genericCharacteristic] })

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, roomCharacteristic2, roomCharacteristic1, premisesCharacteristic],
        'room',
      )
    })
  })
})
