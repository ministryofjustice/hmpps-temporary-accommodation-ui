import BookingClient from '../data/bookingClient'
import ReferenceDataClient from '../data/referenceDataClient'
import DepartureService from './departureService'

import { CallConfig } from '../data/restClient'
import { departureFactory, newDepartureFactory, referenceDataFactory } from '../testutils/factories'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const callConfig = { token: 'some-token' } as CallConfig

  const DepartureClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new DepartureService(DepartureClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    DepartureClientFactory.mockReturnValue(bookingClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createDeparture', () => {
    it('on success returns the departure that has been posted', async () => {
      const newDeparture = newDepartureFactory.build()
      const departure = departureFactory.build()

      bookingClient.markDeparture.mockResolvedValue(departure)

      const postedDeparture = await service.createDeparture(callConfig, 'premisesId', 'bookingId', newDeparture)
      expect(postedDeparture).toEqual(departure)

      expect(DepartureClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.markDeparture).toHaveBeenCalledWith('premisesId', 'bookingId', newDeparture)
    })
  })

  describe('getReferenceData', () => {
    it('should return the reference data needed to create departures', async () => {
      const departureReasons = referenceDataFactory.buildList(2)
      const moveOnCategories = referenceDataFactory.buildList(3)

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'departure-reasons': departureReasons,
            'move-on-categories': moveOnCategories,
          }[category],
        )
      })

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        departureReasons,
        moveOnCategories,
      })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(callConfig)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('departure-reasons')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('move-on-categories')
    })
  })
})
