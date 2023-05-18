import { lostBedFactory } from '../testutils/factories'
import { summaryListRows } from './lostBedListing'

describe('LostBedListing', () => {
  describe('summaryListRows', () => {
    it('returns summary list rows for a lost bed', () => {
      const lostBed = lostBedFactory.build({
        startDate: '2023-01-30',
        endDate: '2023-02-15',
      })

      const result = summaryListRows(lostBed)

      expect(result).toEqual([
        {
          key: { text: 'Start date' },
          value: { text: '30 January 2023' },
        },
        {
          key: { text: 'End date' },
          value: { text: '15 February 2023' },
        },
      ])
    })
  })
})
