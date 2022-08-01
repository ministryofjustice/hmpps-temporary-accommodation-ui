import type { Departure } from 'approved-premises'

import DepartureService from './departureService'
import DepartureClient from '../data/departureClient'
import departureFactory from '../testutils/factories/departure'

jest.mock('../data/departureClient.ts')

describe('DepartureService', () => {
  const departureClient = new DepartureClient(null) as jest.Mocked<DepartureClient>
  let service: DepartureService

  const DepartureClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    DepartureClientFactory.mockReturnValue(departureClient)
    service = new DepartureService(DepartureClientFactory)
  })

  describe('createDeparture', () => {
    it('on success returns the departure that has been posted', async () => {
      const departure: Departure = departureFactory.build()
      departureClient.create.mockResolvedValue(departure)

      const postedDeparture = await service.createDeparture('premisesId', 'bookingId', departure)
      expect(postedDeparture).toEqual(departure)
      expect(departureClient.create).toHaveBeenCalledWith('premisesId', 'bookingId', departure)
    })
  })
})
