import type { Arrival } from 'approved-premises'

import ArrivalService from './arrivalService'
import ArrivalClient from '../data/arrivalClient'
import ArrivalFactory from '../testutils/factories/arrival'

jest.mock('../data/arrivalClient.ts')

describe('ArrivalService', () => {
  const arrivalClient = new ArrivalClient(null) as jest.Mocked<ArrivalClient>
  const arrivalClientFactory = jest.fn()

  const service = new ArrivalService(arrivalClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    arrivalClientFactory.mockReturnValue(arrivalClient)
  })

  describe('createArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const arrival: Arrival = ArrivalFactory.build()
      const token = 'SOME_TOKEN'
      arrivalClient.create.mockResolvedValue(arrival)

      const postedArrival = await service.createArrival(token, 'premisesID', 'bookingId', arrival)
      expect(postedArrival).toEqual(arrival)

      expect(arrivalClientFactory).toHaveBeenCalledWith(token)
      expect(arrivalClient.create).toHaveBeenCalledWith('premisesID', 'bookingId', arrival)
    })
  })
})
