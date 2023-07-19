import paths from '../paths/temporary-accommodation/manage'
import { assessmentSummaryFactory, personFactory } from '../testutils/factories'
import { assessmentTableRows, statusName, statusTag } from './assessmentUtils'

describe('assessmentUtils', () => {
  describe('statusTag', () => {
    it('returns the HTML tag for a given status', () => {
      expect(statusTag('unallocated')).toEqual('<strong class="govuk-tag govuk-tag--grey">Unallocated</strong>')
    })
  })

  describe('statusName', () => {
    it('returns the display name for a given status', () => {
      expect(statusName('in_review')).toEqual('In review')
    })
  })

  describe('assessmentTableRows', () => {
    it('returns a table row for the given assessment summary for the assessments table', () => {
      const assessmentSummary = assessmentSummaryFactory.build({
        id: 'some-id',
        person: personFactory.build({
          name: 'John Smith',
          crn: 'ABC123',
        }),
        arrivalDate: '2023-04-13',
        createdAt: '2023-02-27',
        status: 'unallocated',
      })

      const result = assessmentTableRows(assessmentSummary)

      expect(result).toEqual([
        {
          html: `<a href="${paths.assessments.show({ id: 'some-id' })}">John Smith</a>`,
          attributes: { 'data-sort-value': 'John Smith' },
        },
        { text: 'ABC123' },
        { text: '27 Feb 23', attributes: { 'data-sort-value': '2023-02-27' } },
        { text: '13 Apr 23', attributes: { 'data-sort-value': '2023-04-13' } },
      ])
    })

    it('returns a table row for the given assessment summary for the assessments table with a status cell', () => {
      const assessmentSummary = assessmentSummaryFactory.build({
        id: 'some-id',
        person: personFactory.build({
          name: 'John Smith',
          crn: 'ABC123',
        }),
        arrivalDate: '2023-04-13',
        createdAt: '2023-02-27',
        status: 'unallocated',
      })

      const result = assessmentTableRows(assessmentSummary, true)

      expect(result).toEqual([
        {
          html: `<a href="${paths.assessments.show({ id: 'some-id' })}">John Smith</a>`,
          attributes: { 'data-sort-value': 'John Smith' },
        },
        { text: 'ABC123' },
        { text: '27 Feb 23', attributes: { 'data-sort-value': '2023-02-27' } },
        { text: '13 Apr 23', attributes: { 'data-sort-value': '2023-04-13' } },
        {
          attributes: {
            'data-sort-value': 'Unallocated',
          },
          html: '<strong class="govuk-tag govuk-tag--grey">Unallocated</strong>',
        },
      ])
    })
  })
})
