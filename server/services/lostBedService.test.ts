import type {
  TemporaryAccommodationLostBed as LostBed,
  NewTemporaryAccommodationLostBed as NewLostBed,
} from '@approved-premises/api'

import LostBedService from './lostBedService'
import LostBedClient from '../data/lostBedClient'
import ReferenceDataClient from '../data/referenceDataClient'

import lostBedFactory from '../testutils/factories/lostBed'
import newLostBedFactory from '../testutils/factories/newLostBed'
import referenceDataFactory from '../testutils/factories/referenceData'
import { CallConfig } from '../data/restClient'

jest.mock('../data/lostBedClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('LostBedService', () => {
  const lostBedClient = new LostBedClient(null) as jest.Mocked<LostBedClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const LostBedClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new LostBedService(LostBedClientFactory, ReferenceDataClientFactory)
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    LostBedClientFactory.mockReturnValue(lostBedClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('create', () => {
    it('on success returns the lostBed that has been posted', async () => {
      const lostBed: LostBed = lostBedFactory.build()
      const newLostBed: NewLostBed = newLostBedFactory.build()

      lostBedClient.create.mockResolvedValue(lostBed)

      const postedLostBed = await service.create(callConfig, 'premisesID', newLostBed)

      expect(postedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.create).toHaveBeenCalledWith('premisesID', newLostBed)
    })
  })

  describe('getReferenceData', () => {
    it('should return the lost bed reasons data needed', async () => {
      const lostBedReasons = referenceDataFactory.buildList(2)

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'lost-bed-reasons': lostBedReasons,
          }[category],
        )
      })

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual(lostBedReasons)
      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(callConfig)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('lost-bed-reasons')
    })
  })

  describe('find', () => {
    it('on success returns the lostBed that has been requested', async () => {
      const lostBed = lostBedFactory.build()

      lostBedClient.find.mockResolvedValue(lostBed)

      const retrievedLostBed = await service.find(callConfig, 'premisesId', lostBed.id)
      expect(retrievedLostBed).toEqual(lostBed)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.find).toHaveBeenCalledWith('premisesId', lostBed.id)
    })
  })
})
