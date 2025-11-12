import BedspaceClient from '../data/bedspaceClient'
import ReferenceDataClient from '../data/referenceDataClient'
import BedspaceService from './bedspaceService'
import {
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewBedspaceFactory,
  cas3ReferenceDataFactory,
  cas3UpdateBedspaceFactory,
  characteristicFactory,
  probationRegionFactory,
} from '../testutils/factories'
import * as characteristicUtils from '../utils/characteristicUtils'
import { CallConfig } from '../data/restClient'
import * as bedspaceUtils from '../utils/bedspaceUtils'
import config from '../config'

jest.mock('../data/bedspaceClient')
jest.mock('../data/referenceDataClient')

describe('BedspaceService', () => {
  const bedspaceClient = new BedspaceClient(null) as jest.Mocked<BedspaceClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const bedspaceClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new BedspaceService(bedspaceClientFactory, referenceDataClientFactory)
  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig
  const flagsConfigOriginal = config.flags

  const premisesId = 'some-premises-id'

  beforeEach(() => {
    jest.clearAllMocks()
    bedspaceClientFactory.mockReturnValue(bedspaceClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)

    jest.spyOn(bedspaceUtils, 'populateBedspaceCharacteristics')
    jest.spyOn(characteristicUtils, 'filterCharacteristics')
    jest.spyOn(characteristicUtils, 'characteristicToCas3ReferenceData')

    config.flags.enableCas3v2Api = true
  })

  afterEach(() => {
    config.flags = flagsConfigOriginal
  })

  describe('getSingleBedspace', () => {
    it('should return a bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build()
      bedspaceClient.find.mockResolvedValue(bedspace)

      const result = await service.getSingleBedspace(callConfig, premisesId, bedspace.id)

      expect(result).toBe(bedspace)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.find).toHaveBeenCalledWith(premisesId, bedspace.id)

      expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
    })
  })

  describe('createBedspace', () => {
    it('on success returns the bedspace that has been created', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const newBedspace = cas3NewBedspaceFactory.build({
        ...bedspace,
      })
      bedspaceClient.create.mockResolvedValue(bedspace)

      const postedBedspace = await service.createBedspace(callConfig, premisesId, newBedspace)
      expect(postedBedspace).toEqual(bedspace)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.create).toHaveBeenCalledWith(premisesId, newBedspace)

      expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
    })
  })

  describe('updateBedspace', () => {
    it('on success returns the bedspace that has been updated', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const updatedBedspace = cas3UpdateBedspaceFactory.build({
        reference: bedspace.reference,
        notes: bedspace.notes,
        characteristicIds: bedspace.bedspaceCharacteristics.map(ch => ch.id),
      })
      bedspaceClient.update.mockResolvedValue(bedspace)

      const result = await service.updateBedspace(callConfig, premisesId, bedspace.id, updatedBedspace)
      expect(result).toEqual(bedspace)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.update).toHaveBeenCalledWith(premisesId, bedspace.id, updatedBedspace)

      expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
    })
  })

  describe('archiveBedspace', () => {
    it('calls the client to archive the bedspace', async () => {
      const bedspaceId = 'some-bedspace-id'
      const restartDate = '2025-01-15'
      bedspaceClient.archive.mockResolvedValue()

      await service.archiveBedspace(callConfig, premisesId, bedspaceId, restartDate)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.archive).toHaveBeenCalledWith(premisesId, bedspaceId, { endDate: restartDate })
    })
  })

  describe('cancelArchiveBedspace', () => {
    it('calls the client to cancel the archive for the bedspace and returns the bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build()
      bedspaceClient.cancelArchive.mockResolvedValue(bedspace)

      const result = await service.cancelArchiveBedspace(callConfig, premisesId, bedspace.id)

      expect(result).toEqual(bedspace)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.cancelArchive).toHaveBeenCalledWith(premisesId, bedspace.id)

      expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
    })
  })

  describe('unarchiveBedspace', () => {
    it('calls the client to unarchive the bedspace', async () => {
      const bedspaceId = 'some-bedspace-id'
      const restartDate = '2025-01-15'
      bedspaceClient.unarchive.mockResolvedValue()

      await service.unarchiveBedspace(callConfig, premisesId, bedspaceId, restartDate)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.unarchive).toHaveBeenCalledWith(premisesId, bedspaceId, { restartDate })
    })
  })

  describe('cancelUnarchiveBedspace', () => {
    it('calls the client to cancel the archive for the bedspace and returns the bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build()
      bedspaceClient.cancelUnarchive.mockResolvedValue(bedspace)

      const result = await service.cancelUnarchiveBedspace(callConfig, premisesId, bedspace.id)

      expect(result).toEqual(bedspace)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.cancelUnarchive).toHaveBeenCalledWith(premisesId, bedspace.id)

      expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
    })
  })

  describe('canArchiveBedspace', () => {
    it('calls the client to cancel the archive for the bedspace and returns the bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const response = {
        date: bedspace.endDate,
        entityId: bedspace.id,
        entityReference: 'foo',
      }
      bedspaceClient.canArchive.mockResolvedValue(response)

      const result = await service.canArchiveBedspace(callConfig, premisesId, bedspace.id)

      expect(result).toEqual(response)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.canArchive).toHaveBeenCalledWith(premisesId, bedspace.id)
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted bedspace characteristics', async () => {
      const bedspaceCharacteristic1 = cas3ReferenceDataFactory.build({ description: 'ABC' })
      const bedspaceCharacteristic2 = cas3ReferenceDataFactory.build({ description: 'EFG' })
      const bedspaceCharacteristic3 = cas3ReferenceDataFactory.build({ description: 'HIJ' })

      referenceDataClient.getCas3ReferenceData.mockResolvedValue([
        bedspaceCharacteristic3,
        bedspaceCharacteristic1,
        bedspaceCharacteristic2,
      ])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({
        characteristics: [bedspaceCharacteristic1, bedspaceCharacteristic2, bedspaceCharacteristic3],
      })
      expect(referenceDataClient.getCas3ReferenceData).toHaveBeenCalledWith('BEDSPACE_CHARACTERISTICS')
    })
  })

  describe('get bedspaces for premises', () => {
    it('returns bedspaces for a premises', async () => {
      const bedspaces = cas3BedspacesFactory.build()

      bedspaceClient.get.mockResolvedValue(bedspaces)

      const result = await service.getBedspacesForPremises(callConfig, premisesId)

      expect(bedspaces).toEqual(result)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.get).toHaveBeenCalledWith(premisesId)

      bedspaces.bedspaces.forEach(bedspace => {
        expect(bedspaceUtils.populateBedspaceCharacteristics).toHaveBeenCalledWith(bedspace)
      })
    })
  })

  describe('with the ENABLE_CAS3V2_API flag off', () => {
    beforeEach(() => {
      config.flags.enableCas3v2Api = false
    })

    describe('getReferenceData', () => {
      it('returns sorted bedspace characteristics', async () => {
        const bedspaceCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'room' })
        const bedspaceCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'room' })
        const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
        const premisesCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'premises' })

        referenceDataClient.getReferenceData.mockResolvedValue([
          genericCharacteristic,
          bedspaceCharacteristic2,
          bedspaceCharacteristic1,
          premisesCharacteristic,
        ])

        const result = await service.getReferenceData(callConfig)
        expect(result).toEqual({
          characteristics: [
            characteristicUtils.characteristicToCas3ReferenceData(bedspaceCharacteristic1),
            characteristicUtils.characteristicToCas3ReferenceData(bedspaceCharacteristic2),
            characteristicUtils.characteristicToCas3ReferenceData(genericCharacteristic),
          ],
        })

        expect(characteristicUtils.filterCharacteristics).toHaveBeenCalledWith(
          [genericCharacteristic, bedspaceCharacteristic2, bedspaceCharacteristic1, premisesCharacteristic],
          'room',
        )
      })
    })
  })
})
