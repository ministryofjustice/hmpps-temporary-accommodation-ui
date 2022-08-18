import type { Departure } from 'approved-premises'
import { parseISO } from 'date-fns'

import DepartureService from './departureService'
import DepartureClient from '../data/departureClient'
import ReferenceDataClient from '../data/referenceDataClient'

import departureFactory from '../testutils/factories/departure'
import referenceDataFactory from '../testutils/factories/referenceData'
import departureDtoFactory from '../testutils/factories/departureDto'
import itGetsATokenFromARequest from './shared_examples'

jest.mock('../data/departureClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const departureClient = new DepartureClient(null) as jest.Mocked<DepartureClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const DepartureClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()
  const service = new DepartureService(DepartureClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    DepartureClientFactory.mockReturnValue(departureClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  itGetsATokenFromARequest(service)

  describe('createDeparture', () => {
    it('on success returns the departure that has been posted', async () => {
      const departureDto = departureDtoFactory.build()
      const departure = departureFactory.build()

      departureClient.create.mockResolvedValue(departure)

      const postedDeparture = await service.createDeparture('premisesId', 'bookingId', departureDto)
      expect(postedDeparture).toEqual(departure)
      expect(departureClient.create).toHaveBeenCalledWith('premisesId', 'bookingId', departureDto)
    })
  })

  describe('getDeparture', () => {
    it('on success returns the departure that has been requested', async () => {
      const departure: Departure = departureFactory.build()
      departureClient.get.mockResolvedValue(departure)

      const requestedDeparture = await service.getDeparture('premisesId', 'bookingId', departure.id)

      expect(requestedDeparture).toEqual({
        ...departure,
        dateTime: parseISO(departure.dateTime).toLocaleDateString('en-GB'),
      })
      expect(departureClient.get).toHaveBeenCalledWith('premisesId', 'bookingId', departure.id)
    })
  })

  describe('getReferenceData', () => {
    it('should return the reference data needed to create departures', async () => {
      const departureReasons = referenceDataFactory.buildList(2)
      const moveOnCategories = referenceDataFactory.buildList(3)
      const destinationProviders = referenceDataFactory.buildList(4)

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'departure-reasons': departureReasons,
            'move-on-categories': moveOnCategories,
            'destination-providers': destinationProviders,
          }[category],
        )
      })

      const result = await service.getReferenceData()

      expect(result).toEqual({
        departureReasons,
        moveOnCategories,
        destinationProviders,
      })
    })
  })
})
