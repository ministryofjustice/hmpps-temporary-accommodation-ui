import BedClient from '../data/bedClient'
import pduJson from '../data/pdus.json'
import { CallConfig } from '../data/restClient'
import { bedSearchParametersFactory, bedSearchResultsFactory, pduFactory } from '../testutils/factories'
import BedspaceSearchService from './bedspaceSearchService'

jest.mock('../data/bedClient')
jest.mock('../data/pdus.json', () => {
  return [...jest.requireActual('../data/pdus.json')]
})

describe('BedspaceSearchService', () => {
  const bedClient = new BedClient(null) as jest.Mocked<BedClient>

  const bedClientFactory = jest.fn()

  const service = new BedspaceSearchService(bedClientFactory)

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.restoreAllMocks()
    bedClientFactory.mockReturnValue(bedClient)
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
    afterEach(() => {
      pduJson.length = 0
      pduJson.push(...jest.requireActual('../data/pdus.json'))
    })

    it('returns sorted PDUs', async () => {
      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      pduJson.length = 0
      pduJson.push(pdu2, pdu3, pdu1)

      const result = await service.getReferenceData()
      expect(result).toEqual({
        pdus: [pdu1, pdu2, pdu3],
      })
    })
  })
})
