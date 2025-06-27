import PremisesClient from '../../data/v2/premisesClient'
import { CallConfig } from '../../data/restClient'
import {
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  probationRegionFactory,
} from '../../testutils/factories'
import { statusTag } from '../../utils/premisesUtils'
import PremisesService from './premisesService'

jest.mock('../../data/v2/premisesClient')
jest.mock('../../data/referenceDataClient')
jest.mock('../../utils/premisesUtils')
jest.mock('../../utils/viewUtils')
jest.mock('../../utils/characteristicUtils')
jest.mock('../../utils/placeUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const premisesClientFactory = jest.fn()
  const service = new PremisesService(premisesClientFactory)
  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
  })

  describe('tableRows', () => {
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
    const searchResult3 = cas3PremisesSearchResultFactory.build({
      addressLine1: '62 West Wallaby Street',
      town: 'Wigan',
      postcode: 'WG7 7FU',
      pdu: 'Wigan',
    })

    it.each([
      [
        [searchResult2, searchResult1, searchResult3],
        [searchResult2, searchResult1, searchResult3],
      ],
      [
        [searchResult2, searchResult1],
        [searchResult2, searchResult1],
      ],
      [[], []],
      [undefined, []],
    ])('returns table view of the premises for Temporary Accommodation', (searchResults, expectedResults) => {
      const premises = cas3PremisesSearchResultsFactory.build({ results: searchResults })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockImplementation(status => `<strong>${status}</strong>`)

      const rows = service.tableRows(premises)

      const expectedRows = expectedResults.map(prem => {
        const address = [prem.addressLine1, prem.addressLine2, prem.town, prem.postcode]
          .filter(s => s !== undefined && s !== '')
          .join('<br />')

        // hrefs will need updated for relevant tickets
        const bedspaces =
          prem.bedspaces.length === 0
            ? `No bedspaces<br /><a href="#">Add a bedspace</a>`
            : prem.bedspaces
                .map(bed => {
                  const archivedTag =
                    bed.status === 'archived' ? ` <strong class="govuk-tag govuk-tag--grey">Archived</strong>` : ''
                  return `<a href="#">${bed.reference}</a>${archivedTag}`
                })
                .join('<br />')

        return [{ html: address }, { html: bedspaces }, { text: prem.pdu }, { html: `<a href="#">Manage</a>` }]
      })

      expect(rows).toEqual(expectedRows)
    })
  })

  describe('searchDataAndGenerateTableRows', () => {
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

    it('returns search results with table rows for online status by default', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1, searchResult2],
        totalPremises: 2,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress)

      expect(result).toEqual({
        ...searchResults,
        tableRows: expect.any(Array),
      })
      expect(result.tableRows).toHaveLength(2)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('London', 'online')
    })

    it('returns search results with table rows for specified status', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1],
        totalPremises: 1,
        totalOnlineBedspaces: 2,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress, 'archived')

      expect(result).toEqual({
        ...searchResults,
        tableRows: expect.any(Array),
      })
      expect(result.tableRows).toHaveLength(1)
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

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress)

      expect(result).toEqual({
        ...searchResults,
        tableRows: [],
      })
      expect(result.tableRows).toHaveLength(0)
      expect(result.totalPremises).toBe(0)
      expect(result.totalOnlineBedspaces).toBe(0)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('', 'online')
    })
  })
})
