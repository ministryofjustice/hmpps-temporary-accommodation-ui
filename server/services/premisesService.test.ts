import { createMock } from '@golevelup/ts-jest'
import PremisesClient from '../data/premisesClient'
import { CallConfig } from '../data/restClient'
import {
  assessmentFactory,
  cas3ArchivePremisesFactory,
  cas3BedspacesReferenceFactory,
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3ReferenceDataFactory,
  cas3UnarchivePremisesFactory,
  cas3UpdatePremisesFactory,
  localAuthorityFactory,
  pduFactory,
  probationRegionFactory,
} from '../testutils/factories'
import PremisesService from './premisesService'
import { ReferenceDataClient } from '../data'
import { AssessmentsService } from './index'

jest.mock('../data/premisesClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/viewUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const premisesClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()
  const service = new PremisesService(premisesClientFactory, referenceDataClientFactory)
  const assessmentService = createMock<AssessmentsService>({})

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig
  const premisesId = 'premises-id'
  const assessment = assessmentFactory.build({ status: 'ready_to_place' })

  beforeEach(() => {
    jest.clearAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
    assessmentService.findAssessment.mockResolvedValue(assessment)
  })

  describe('createPremises', () => {
    it('on success returns the premises that has been created', async () => {
      const premises = cas3PremisesFactory.build()
      const newPremises = cas3NewPremisesFactory.build({ ...premises })
      premisesClient.create.mockResolvedValue(premises)

      const createdPremises = await service.createPremises(callConfig, newPremises)
      expect(createdPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.create).toHaveBeenCalledWith(newPremises)
    })
  })

  describe('updatePremises', () => {
    it('on success returns the premises that has been updated', async () => {
      const premises = cas3PremisesFactory.build()
      const updatedPremises = cas3UpdatePremisesFactory.build({ ...premises })
      premisesClient.update.mockResolvedValue(premises)

      const result = await service.updatePremises(callConfig, premises.id, updatedPremises)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.update).toHaveBeenCalledWith(premises.id, updatedPremises)
    })
  })

  describe('canArchivePremises', () => {
    it('returns the bedspaces that are preventing a premises from being archived', async () => {
      const bedspacesReference = cas3BedspacesReferenceFactory.build()
      premisesClient.canArchive.mockResolvedValue(bedspacesReference)

      const result = await service.canArchivePremises(callConfig, premisesId)
      expect(result).toEqual(bedspacesReference)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.canArchive).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('archivePremises', () => {
    it('on success returns the premises that has been archived', async () => {
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      const archivePayload = cas3ArchivePremisesFactory.build()
      premisesClient.archive.mockResolvedValue(premises)

      const result = await service.archivePremises(callConfig, premises.id, archivePayload)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.archive).toHaveBeenCalledWith(premises.id, archivePayload)
    })
  })

  describe('unarchivePremises', () => {
    it('on success returns the premises that has been unarchived', async () => {
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const unarchivePayload = cas3UnarchivePremisesFactory.build()
      premisesClient.unarchive.mockResolvedValue(premises)

      const result = await service.unarchivePremises(callConfig, premises.id, unarchivePayload)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.unarchive).toHaveBeenCalledWith(premises.id, unarchivePayload)
    })
  })

  describe('cancelArchivePremises', () => {
    it('on success returns the premises that has had its archive cancelled', async () => {
      const premises = cas3PremisesFactory.build({ status: 'online', endDate: null })
      premisesClient.cancelArchive.mockResolvedValue(premises)

      const result = await service.cancelArchivePremises(callConfig, premises.id)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.cancelArchive).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('cancelUnarchivePremises', () => {
    it('on success returns the premises that has had its unarchive cancelled', async () => {
      const premises = cas3PremisesFactory.build({ status: 'archived', scheduleUnarchiveDate: null })
      premisesClient.cancelUnarchive.mockResolvedValue(premises)

      const result = await service.cancelUnarchivePremises(callConfig, premises.id)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.cancelUnarchive).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('search', () => {
    const searchResult1 = cas3PremisesSearchResultFactory.build({
      addressLine1: '32 Windsor Gardens',
      town: 'London',
      postcode: 'W9 3RQ',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
      bedspaces: [],
    })
    const searchResult2 = cas3PremisesSearchResultFactory.build({
      addressLine1: '221c Baker Street',
      town: 'London',
      postcode: 'NW1 6XE',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
    })

    it('returns search results for online status by default', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1, searchResult2],
        totalPremises: 2,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, postcodeOrAddress)

      expect(result).toEqual(searchResults)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('London', 'online')
    })

    it('returns search results for specified status', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1],
        totalPremises: 1,
        totalOnlineBedspaces: 2,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, postcodeOrAddress, 'archived')

      expect(result).toEqual(searchResults)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('London', 'archived')
    })

    it('returns empty search results when there are no properties in the database', async () => {
      const postcodeOrAddress = ''
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, postcodeOrAddress)

      expect(result).toEqual(searchResults)
      expect(result.totalPremises).toBe(0)
      expect(result.totalOnlineBedspaces).toBe(0)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('', 'online')
    })
  })

  describe('getSinglePremises', () => {
    it('should return the premises', async () => {
      const premises = cas3PremisesFactory.build({ id: premisesId })
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getSinglePremises(callConfig, premisesId)

      expect(result).toBe(premises)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getReferenceData', () => {
    const localAuthority1 = localAuthorityFactory.build({ name: 'Newcastle' })
    const localAuthority2 = localAuthorityFactory.build({ name: 'Gateshead' })
    const localAuthority3 = localAuthorityFactory.build({ name: 'Sunderland' })
    const unsortedLocalAuthorities = [localAuthority1, localAuthority2, localAuthority3]

    const characteristic1 = cas3ReferenceDataFactory.build({ description: 'Rural property' })
    const characteristic2 = cas3ReferenceDataFactory.build({ description: 'Ground floor accessible' })
    const characteristic3 = cas3ReferenceDataFactory.build({ description: 'Pub nearby' })
    const unsortedCharacteristics = [characteristic1, characteristic2, characteristic3]

    const unsortedProbationRegions = [callConfig.probationRegion]

    const pdu1 = pduFactory.build({ name: 'Newcastle upon Tyne' })
    const pdu2 = pduFactory.build({ name: 'North Tyneside and Northumberland' })
    const pdu3 = pduFactory.build({ name: 'Gateshead and South Tyneside' })
    const unsortedPdus = [pdu1, pdu2, pdu3]

    it('returns sorted reference data', async () => {
      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'local-authority-areas') {
          return unsortedLocalAuthorities
        }
        if (objectType === 'probation-regions') {
          return unsortedProbationRegions
        }
        return unsortedPdus
      })
      referenceDataClient.getCas3ReferenceData.mockResolvedValue(unsortedCharacteristics)

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        localAuthorities: [localAuthority2, localAuthority1, localAuthority3],
        characteristics: [characteristic2, characteristic3, characteristic1],
        probationRegions: [callConfig.probationRegion],
        pdus: [pdu3, pdu1, pdu2],
      })

      expect(referenceDataClientFactory).toHaveBeenCalledWith(callConfig)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('local-authority-areas')
      expect(referenceDataClient.getCas3ReferenceData).toHaveBeenCalledWith('PREMISES_CHARACTERISTICS')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-regions')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    })
  })
})
