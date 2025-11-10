import { ReferenceDataClient } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import { CallConfig } from '../data/restClient'
import {
  bedspaceSearchApiParametersFactory,
  cas3ReferenceDataFactory,
  cas3v2BedspaceSearchResultsFactory,
  characteristicFactory,
  pduFactory,
  probationRegionFactory,
} from '../testutils/factories'
import BedspaceSearchService from './bedspaceSearchService'
import * as characteristicUtils from '../utils/characteristicUtils'

jest.mock('../data/bedspaceClient')
jest.mock('../data/referenceDataClient')

describe('BedspaceSearchService', () => {
  const bedspaceClient = new BedspaceClient(null) as jest.Mocked<BedspaceClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const bedspaceClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new BedspaceSearchService(bedspaceClientFactory, referenceDataClientFactory)

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.restoreAllMocks()
    bedspaceClientFactory.mockReturnValue(bedspaceClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
    jest.spyOn(characteristicUtils, 'filterCharacteristics')
  })

  describe('search', () => {
    it('returns search results for the provided search paramters', async () => {
      const searchResults = cas3v2BedspaceSearchResultsFactory.build()
      const searchParameters = bedspaceSearchApiParametersFactory.build()

      bedspaceClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, searchParameters)

      expect(result).toEqual(searchResults)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.search).toHaveBeenCalledWith({ ...searchParameters })
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted PDUs, wheelchair accessibility, occupancy, gender and sexual risk characteristics', async () => {
      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      const roomCharacteristic1 = cas3ReferenceDataFactory.build({ description: 'GHI', name: 'isWheelchairAccessible' })
      const roomCharacteristic2 = cas3ReferenceDataFactory.build({
        description: 'FOO',
        name: 'someOtherCharacteristic',
      })
      const premisesCharacteristic1 = cas3ReferenceDataFactory.build({ description: 'ABC', name: 'isSharedProperty' })
      const premisesCharacteristic2 = cas3ReferenceDataFactory.build({ description: 'DEF', name: 'isSingleOccupancy' })
      const premisesCharacteristic3 = cas3ReferenceDataFactory.build({
        description: 'Risk to adults',
        name: 'notSuitableForSexualRiskToAdults',
      })
      const premisesCharacteristic4 = cas3ReferenceDataFactory.build({
        description: 'Risk to children',
        name: 'notSuitableForSexualRiskToChildren',
      })
      const premisesCharacteristic5 = cas3ReferenceDataFactory.build({
        description: 'Should not show',
        name: 'shouldNotShow',
      })
      const genderCharacteristic1 = cas3ReferenceDataFactory.build({ description: 'Men only', name: 'isMenOnly' })
      const genderCharacteristic2 = cas3ReferenceDataFactory.build({ description: 'Women only', name: 'isWomenOnly' })

      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'probation-delivery-units') {
          return [pdu2, pdu3, pdu1]
        }
        return []
      })
      referenceDataClient.getCas3ReferenceData.mockImplementation(async (type: string) => {
        if (type === 'BEDSPACE_CHARACTERISTICS') {
          return [roomCharacteristic1, roomCharacteristic2]
        }
        if (type === 'PREMISES_CHARACTERISTICS') {
          return [
            premisesCharacteristic1,
            premisesCharacteristic2,
            premisesCharacteristic3,
            premisesCharacteristic4,
            premisesCharacteristic5,
            genderCharacteristic1,
            genderCharacteristic2,
          ]
        }
        return []
      })

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        pdus: [pdu1, pdu2, pdu3],
        wheelchairAccessibility: [roomCharacteristic1],
        occupancy: [premisesCharacteristic1, premisesCharacteristic2],
        gender: [genderCharacteristic1, genderCharacteristic2],
        sexualRisk: [premisesCharacteristic3, premisesCharacteristic4],
      })

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
      expect(referenceDataClient.getCas3ReferenceData).toHaveBeenCalledWith('BEDSPACE_CHARACTERISTICS')
      expect(referenceDataClient.getCas3ReferenceData).toHaveBeenCalledWith('PREMISES_CHARACTERISTICS')
    })
  })
})
