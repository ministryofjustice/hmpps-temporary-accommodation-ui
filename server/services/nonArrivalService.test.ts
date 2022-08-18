import type { NonArrival } from 'approved-premises'

import NonArrivalService from './nonArrivalService'
import NonArrivalClient from '../data/nonArrivalClient'
import NonArrivalFactory from '../testutils/factories/nonArrival'
import itGetsATokenFromARequest from './shared_examples'

jest.mock('../data/nonArrivalClient.ts')

describe('NonArrivalService', () => {
  const nonArrivalClient = new NonArrivalClient(null) as jest.Mocked<NonArrivalClient>
  const nonArrivalClientFactory = jest.fn()

  const service = new NonArrivalService(nonArrivalClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    nonArrivalClientFactory.mockReturnValue(nonArrivalClient)
  })

  itGetsATokenFromARequest(service)

  describe('createNonArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival: NonArrival = NonArrivalFactory.build()
      nonArrivalClient.create.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival('premisesID', 'bookingId', nonArrival)
      expect(postedNonArrival).toEqual(nonArrival)
    })
  })
})
