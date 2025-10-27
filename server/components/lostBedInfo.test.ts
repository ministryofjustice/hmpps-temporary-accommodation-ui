import { cas3VoidBedspaceFactory } from '../testutils/factories'
import { statusTag } from '../utils/lostBedUtils'
import { formatLines } from '../utils/viewUtils'
import summaryListRows from './lostBedInfo'

describe('LostBedInfo', () => {
  describe('lostBed summaryListRows', () => {
    it('returns summary list rows for an active lost bed', () => {
      const lostBed = cas3VoidBedspaceFactory.active().build({
        startDate: '2023-03-21',
        endDate: '2023-03-24',
        reason: { name: 'some active void Reason' },
        costCentre: 'HMPPS',
      })

      const result = summaryListRows(lostBed)

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
            text: 'Cost Centre',
          },
          value: {
            text: 'HMPPS',
          },
        },
        {
          key: {
            text: 'Reason',
          },
          value: {
            text: 'some active void Reason',
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
    it('returns summary list rows for a cancelled lost bed', () => {
      const lostBed = cas3VoidBedspaceFactory.cancelled().build({
        startDate: '2023-04-21',
        endDate: '2023-04-24',
        reason: { name: 'some cancelled void Reason' },
        costCentre: 'SUPPLIER',
      })

      const result = summaryListRows(lostBed)

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
            text: 'Cost Centre',
          },
          value: {
            text: 'Supplier',
          },
        },
        {
          key: {
            text: 'Reason',
          },
          value: {
            text: 'some cancelled void Reason',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: formatLines(lostBed.cancellationNotes),
          },
        },
      ])
    })
  })
})
