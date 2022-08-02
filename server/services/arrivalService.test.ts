import type { Arrival } from 'approved-premises'

import ArrivalService from './arrivalService'
import ArrivalClient from '../data/arrivalClient'
import ArrivalFactory from '../testutils/factories/arrival'

jest.mock('../data/arrivalClient.ts')

describe('ArrivalService', () => {
  const arrivalClient = new ArrivalClient(null) as jest.Mocked<ArrivalClient>
  let service: ArrivalService

  const arrivalClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    arrivalClientFactory.mockReturnValue(arrivalClient)
    service = new ArrivalService(arrivalClientFactory)
  })

  describe('createArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const arrival: Arrival = ArrivalFactory.build()
      arrivalClient.create.mockResolvedValue(arrival)

      const postedArrival = await service.createArrival('premisesID', 'bookingId', arrival)
      expect(postedArrival).toEqual(arrival)
    })
  })
})
