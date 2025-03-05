import { ReferenceDataClient } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import { CallConfig } from '../data/restClient'
import {
  bedSearchApiParametersFactory,
  bedSearchResultsFactory,
  characteristicFactory,
  pduFactory,
  probationRegionFactory,
} from '../testutils/factories'
import BedspaceSearchService from './bedspaceSearchService'

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
  })

  describe('search', () => {
    it('returns search results for the provided search paramters', async () => {
      const searchResults = bedSearchResultsFactory.build()
      const searchParameters = bedSearchApiParametersFactory.build()

      bedspaceClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, searchParameters)

      expect(result).toEqual(searchResults)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.search).toHaveBeenCalledWith({
        serviceName: 'temporary-accommodation',
        ...searchParameters,
      })
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted PDUs, wheelchair accessibility and occupancy characteristics', async () => {
      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      const premisesCharacteristic1 = characteristicFactory.build({
        name: 'ABC',
        modelScope: 'premises',
        propertyName: 'isSharedProperty',
      })

      const premisesCharacteristic2 = characteristicFactory.build({
        name: 'DEF',
        modelScope: 'premises',
        propertyName: 'isSingleOccupancy',
      })

      const roomCharacteristic = characteristicFactory.build({
        name: 'GHI',
        modelScope: 'room',
        propertyName: 'isWheelchairAccessible',
      })

      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'probation-delivery-units') {
          return [pdu2, pdu3, pdu1]
        }
        if (objectType === 'characteristics') {
          return [roomCharacteristic, premisesCharacteristic1, premisesCharacteristic2]
        }
        return []
      })

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        pdus: [pdu1, pdu2, pdu3],
        wheelchairAccessibility: [roomCharacteristic],
        occupancy: [premisesCharacteristic1, premisesCharacteristic2],
      })

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('characteristics')
    })
  })
})
