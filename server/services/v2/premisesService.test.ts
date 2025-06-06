import { PremisesSearchParameters } from '@approved-premises/ui'
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
      [[searchResult2, searchResult1, searchResult3], undefined, [searchResult2, searchResult1, searchResult3]],
      [[searchResult2, searchResult1], 'Westminster', [searchResult2, searchResult1]],
      [[], 'XYZ', []],
      [undefined, 'XYZ', []],
    ])(
      'returns table view of the premises for Temporary Accommodation with an optional search for an address',
      async (searchResults, postcodeOrAddress, expectedResults) => {
        const params: PremisesSearchParameters = { postcodeOrAddress }

        premisesClient.search.mockResolvedValue(cas3PremisesSearchResultsFactory.build({ results: searchResults }))
        ;(statusTag as jest.MockedFunction<typeof statusTag>).mockImplementation(status => `<strong>${status}</strong>`)

        const rows = await service.tableRows(callConfig, params)

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

        expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
        expect(premisesClient.search).toHaveBeenCalled()
      },
    )
  })
})
