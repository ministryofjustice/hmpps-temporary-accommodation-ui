import type { LostBed, NewLostBed } from '@approved-premises/api'

import LostBedService from './lostBedService'
import LostBedClient from '../data/lostBedClient'
import ReferenceDataClient from '../data/referenceDataClient'

import lostBedFactory from '../testutils/factories/lostBed'
import newLostBedFactory from '../testutils/factories/newLostBed'
import referenceDataFactory from '../testutils/factories/referenceData'
import { createMockRequest } from '../testutils/createMockRequest'

jest.mock('../data/lostBedClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('LostBedService', () => {
  const lostBedClient = new LostBedClient(null) as jest.Mocked<LostBedClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const LostBedClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new LostBedService(LostBedClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    LostBedClientFactory.mockReturnValue(lostBedClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createLostBed', () => {
    it('on success returns the lostBed that has been posted', async () => {
      const lostBed: LostBed = lostBedFactory.build()
      const newLostBed: NewLostBed = newLostBedFactory.build()

      const request = createMockRequest()
      lostBedClient.create.mockResolvedValue(lostBed)

      const postedLostBed = await service.createLostBed(request, 'premisesID', newLostBed)

      expect(postedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(request)
      expect(lostBedClient.create).toHaveBeenCalledWith('premisesID', newLostBed)
    })
  })

  describe('getReferenceData', () => {
    it('should return the lost bed reasons data needed', async () => {
      const lostBedReasons = referenceDataFactory.buildList(2)
      const request = createMockRequest()

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'lost-bed-reasons': lostBedReasons,
          }[category],
        )
      })

      const result = await service.getReferenceData(request)

      expect(result).toEqual(lostBedReasons)
      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(request)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('lost-bed-reasons')
    })
  })
})
