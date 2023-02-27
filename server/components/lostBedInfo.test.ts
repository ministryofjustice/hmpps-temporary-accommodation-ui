import lostBedFactory from '../testutils/factories/lostBed'
import { formatLines } from '../utils/viewUtils'
import summaryListRows from './lostBedInfo'
import { statusTag } from '../utils/lostBedUtils'

jest.mock('../utils/viewUtils')

describe('LostBedInfo', () => {
  describe('lostBed summaryListRows', () => {
    it('returns summary list rows for an active lost bed', async () => {
      const lostBed = lostBedFactory.active().build({
        startDate: '2023-03-21',
        endDate: '2023-03-24',
      })

      const result = await summaryListRows(lostBed)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusTag('active', 'voidsOnly'),
          },
        },
        {
          key: {
            text: 'Start date',
          },
          value: {
            text: '21 March 2023',
          },
        },
        {
          key: {
            text: 'End date',
          },
          value: {
            text: '24 March 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: formatLines(lostBed.notes),
          },
        },
      ])
    })
    it('returns summary list rows for a cancelled lost bed', async () => {
      const lostBed = lostBedFactory.cancelled().build({
        startDate: '2023-04-21',
        endDate: '2023-04-24',
      })

      const result = await summaryListRows(lostBed)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusTag('cancelled', 'voidsOnly'),
          },
        },
        {
          key: {
            text: 'Start date',
          },
          value: {
            text: '21 April 2023',
          },
        },
        {
          key: {
            text: 'End date',
          },
          value: {
            text: '24 April 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: formatLines(lostBed.notes),
          },
        },
      ])
    })
  })
})
