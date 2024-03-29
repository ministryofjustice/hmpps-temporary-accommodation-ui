import type { LostBed, NewLostBed } from '@approved-premises/api'

import LostBedClient from '../data/lostBedClient'
import ReferenceDataClient from '../data/referenceDataClient'
import LostBedService from './lostBedService'

import { CallConfig } from '../data/restClient'
import {
  lostBedCancellationFactory,
  lostBedFactory,
  newLostBedCancellationFactory,
  newLostBedFactory,
  referenceDataFactory,
  updateLostBedFactory,
} from '../testutils/factories'

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

  describe('update', () => {
    it('on success returns the updated lostBed', async () => {
      const lostBed = lostBedFactory.build()
      const lostBedUpdate = updateLostBedFactory.build({
        ...lostBed,
        reason: lostBed.reason.id,
      })

      lostBedClient.update.mockResolvedValue(lostBed)

      const updatedLostBed = await service.update(callConfig, 'premisesId', lostBed.id, lostBedUpdate)
      expect(updatedLostBed).toEqual(lostBed)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.update).toHaveBeenCalledWith('premisesId', lostBed.id, lostBedUpdate)
    })
  })

  describe('cancel', () => {
    it('on success returns lostBedCancellation', async () => {
      const lostBedCancellation = lostBedCancellationFactory.build()
      const newLostBedCancellation = newLostBedCancellationFactory.build({ ...lostBedCancellation })

      lostBedClient.cancel.mockResolvedValue(lostBedCancellation)

      const cancelledLostBed = await service.cancel(callConfig, 'premisesId', 'lostBedId', newLostBedCancellation)
      expect(cancelledLostBed).toEqual(lostBedCancellation)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.cancel).toHaveBeenCalledWith('premisesId', 'lostBedId', newLostBedCancellation)
    })
  })

  describe('getUpdateLostBed', () => {
    it('on success returns lostBed', async () => {
      const lostBed = lostBedFactory.build()

      lostBedClient.find.mockResolvedValue(lostBed)

      const updatedLostBed = await service.getUpdateLostBed(callConfig, 'premisesId', 'lostBedId')

      expect(updatedLostBed).toEqual({ ...lostBed, reason: lostBed.reason.id })

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.find).toHaveBeenCalledWith('premisesId', 'lostBedId')
    })
  })
})
