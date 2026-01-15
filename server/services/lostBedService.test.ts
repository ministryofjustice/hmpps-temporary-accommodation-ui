import LostBedClient from '../data/lostBedClient'
import ReferenceDataClient from '../data/referenceDataClient'
import LostBedService from './lostBedService'

import { CallConfig } from '../data/restClient'
import {
  cas3VoidBedspaceCancellationFactory,
  cas3VoidBedspaceFactory,
  cas3VoidBedspaceReasonFactory,
  cas3VoidBedspaceRequestFactory,
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
    jest.clearAllMocks()
    LostBedClientFactory.mockReturnValue(lostBedClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('create', () => {
    it('on success returns the lostBed that has been posted', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()
      const newLostBed = cas3VoidBedspaceRequestFactory.build()

      lostBedClient.create.mockResolvedValue(lostBed)

      const postedLostBed = await service.create(callConfig, 'premisesId', lostBed.bedspaceId, newLostBed)

      expect(postedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.create).toHaveBeenCalledWith('premisesId', lostBed.bedspaceId, newLostBed)
    })
  })

  describe('getReferenceData', () => {
    it('should return the lost bed reasons data needed', async () => {
      const lostBedReasons = cas3VoidBedspaceReasonFactory.buildList(2)

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
      const lostBed = cas3VoidBedspaceFactory.build()

      lostBedClient.find.mockResolvedValue(lostBed)

      const retrievedLostBed = await service.find(callConfig, 'premisesId', lostBed.bedspaceId, lostBed.id)
      expect(retrievedLostBed).toEqual(lostBed)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.find).toHaveBeenCalledWith('premisesId', lostBed.bedspaceId, lostBed.id)
    })
  })

  describe('update', () => {
    it('on success returns the updated lostBed', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()
      const lostBedUpdate = cas3VoidBedspaceRequestFactory.build()

      lostBedClient.update.mockResolvedValue(lostBed)

      const updatedLostBed = await service.update(
        callConfig,
        'premisesId',
        lostBed.bedspaceId,
        lostBed.id,
        lostBedUpdate,
      )
      expect(updatedLostBed).toEqual(lostBed)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.update).toHaveBeenCalledWith('premisesId', lostBed.bedspaceId, lostBed.id, lostBedUpdate)
    })
  })

  describe('cancel', () => {
    it('on success returns lostBedCancellation', async () => {
      const lostBedCancellation = cas3VoidBedspaceCancellationFactory.build()

      lostBedClient.cancel.mockResolvedValue(lostBedCancellation)

      const cancelledLostBed = await service.cancel(
        callConfig,
        'premisesId',
        'bedspaceId',
        'lostBedId',
        lostBedCancellation,
      )
      expect(cancelledLostBed).toEqual(lostBedCancellation)

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.cancel).toHaveBeenCalledWith('premisesId', 'bedspaceId', 'lostBedId', lostBedCancellation)
    })
  })

  describe('getUpdateLostBed', () => {
    it('on success returns lostBed', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()

      lostBedClient.find.mockResolvedValue(lostBed)

      const updatedLostBed = await service.getUpdateLostBed(callConfig, 'premisesId', 'bedspaceId', 'lostBedId')

      expect(updatedLostBed).toEqual({ ...lostBed, reasonId: lostBed.reason.id })

      expect(LostBedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(lostBedClient.find).toHaveBeenCalledWith('premisesId', 'bedspaceId', 'lostBedId')
    })
  })
})
