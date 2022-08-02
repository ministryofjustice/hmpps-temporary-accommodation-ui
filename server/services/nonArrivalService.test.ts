import type { NonArrival } from 'approved-premises'

import NonArrivalService from './nonArrivalService'
import NonArrivalClient from '../data/nonArrivalClient'
import NonArrivalFactory from '../testutils/factories/nonArrival'

jest.mock('../data/nonArrivalClient.ts')

describe('NonArrivalService', () => {
  const nonArrivalClient = new NonArrivalClient(null) as jest.Mocked<NonArrivalClient>
  let service: NonArrivalService

  const nonArrivalClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    nonArrivalClientFactory.mockReturnValue(nonArrivalClient)
    service = new NonArrivalService(nonArrivalClientFactory)
  })

  describe('createNonArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival: NonArrival = NonArrivalFactory.build()
      nonArrivalClient.create.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival('premisesID', 'bookingId', nonArrival)
      expect(postedNonArrival).toEqual(nonArrival)
    })
  })
})
