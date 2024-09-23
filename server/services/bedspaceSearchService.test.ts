import { ReferenceDataClient } from '../data'
import BedClient from '../data/bedClient'
import { CallConfig } from '../data/restClient'
import {
  bedSearchParametersFactory,
  bedSearchResultsFactory,
  pduFactory,
  probationRegionFactory,
} from '../testutils/factories'
import BedspaceSearchService from './bedspaceSearchService'

jest.mock('../data/bedClient')
jest.mock('../data/referenceDataClient')

describe('BedspaceSearchService', () => {
  const bedClient = new BedClient(null) as jest.Mocked<BedClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const bedClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new BedspaceSearchService(bedClientFactory, referenceDataClientFactory)

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.restoreAllMocks()
    bedClientFactory.mockReturnValue(bedClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('search', () => {
    it('returns search results for the provided search paramters', async () => {
      const searchResults = bedSearchResultsFactory.build()
      const searchParameters = bedSearchParametersFactory.build()

      bedClient.search.mockResolvedValue(searchResults)

      const result = await service.search(callConfig, searchParameters)

      expect(result).toEqual(searchResults)

      expect(bedClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedClient.search).toHaveBeenCalledWith({
        serviceName: 'temporary-accommodation',
        ...searchParameters,
      })
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted PDUs', async () => {
      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      referenceDataClient.getReferenceData.mockResolvedValue([pdu2, pdu3, pdu1])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({
        pdus: [pdu1, pdu2, pdu3],
      })

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    })
  })
})
