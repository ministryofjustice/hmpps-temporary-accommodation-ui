import bedSearchResult from '../testutils/factories/bedSearchResult'
import summaryListRows from './bedspaceSearchResult'

describe('BedspaceSearchResult', () => {
  describe('summaryListRows', () => {
    it('returns summary list rows for a bedspace search result', async () => {
      const searchResult = bedSearchResult.build({
        premises: {
          addressLine1: 'First address line',
          postcode: 'Postcode',
          bedCount: 7,
        },
      })

      const result = await summaryListRows(searchResult)

      expect(result).toEqual([
        {
          key: {
            text: 'Address',
          },
          value: {
            text: `First address line, Postcode`,
          },
        },
        {
          key: {
            text: 'Bedspaces in property',
          },
          value: {
            text: '7',
          },
        },
      ])
    })
  })
})
