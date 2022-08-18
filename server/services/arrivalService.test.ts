import type { Arrival } from 'approved-premises'

import ArrivalService from './arrivalService'
import ArrivalClient from '../data/arrivalClient'
import ArrivalFactory from '../testutils/factories/arrival'
import itGetsATokenFromARequest from './shared_examples'

jest.mock('../data/arrivalClient.ts')

describe('ArrivalService', () => {
  const arrivalClient = new ArrivalClient(null) as jest.Mocked<ArrivalClient>
  const arrivalClientFactory = jest.fn()

  const service = new ArrivalService(arrivalClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    arrivalClientFactory.mockReturnValue(arrivalClient)
  })

  itGetsATokenFromARequest(service)

  describe('createArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const arrival: Arrival = ArrivalFactory.build()
      arrivalClient.create.mockResolvedValue(arrival)

      const postedArrival = await service.createArrival('premisesID', 'bookingId', arrival)
      expect(postedArrival).toEqual(arrival)
    })
  })
})
