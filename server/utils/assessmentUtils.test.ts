import paths from '../paths/temporary-accommodation/manage'
import { assessmentFactory, assessmentSummaryFactory, personFactory } from '../testutils/factories'
import { assessmentActions, assessmentTableRows, statusName, statusTag } from './assessmentUtils'

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
          html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">John Smith</a>`,
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
          html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">John Smith</a>`,
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

  describe('assessmentActions', () => {
    it('returns the "reject" and "in_review" actions for an assessment with a status of "unallocated"', () => {
      const assessment = assessmentFactory.build({
        status: 'unallocated',
      })

      const result = assessmentActions(assessment)

      expect(result).toEqual([
        {
          text: 'In review',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'in_review' }),
          newTab: false,
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
          newTab: false,
        },
      ])
    })

    it('returns the "unallocated", "ready_to_place" and "rejected" actions for an assessment with a status of "in_review"', () => {
      const assessment = assessmentFactory.build({
        status: 'in_review',
      })

      const result = assessmentActions(assessment)

      expect(result).toEqual([
        {
          text: 'Ready to place',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'ready_to_place' }),
          newTab: false,
        },
        {
          text: 'Unallocated',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'unallocated' }),
          newTab: false,
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
          newTab: false,
        },
      ])
    })

    it('returns the "closed", "in_review", "reject", and "Place referral" actions for an assessment with a status of "ready_to_place"', () => {
      const assessment = assessmentFactory.build({
        status: 'ready_to_place',
      })

      const result = assessmentActions(assessment)

      expect(result).toEqual([
        {
          text: 'Close',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'closed' }),
          newTab: false,
        },
        {
          text: 'In review',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'in_review' }),
          newTab: false,
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
          newTab: false,
        },
        {
          classes: 'govuk-button--secondary',
          href: paths.bedspaces.search({}),
          text: 'Place referral',
          newTab: true,
        },
      ])
    })

    it('returns the "ready_to_place" action for an assessment with a status of "closed"', () => {
      const assessment = assessmentFactory.build({
        status: 'closed',
      })

      const result = assessmentActions(assessment)

      expect(result).toEqual([
        {
          text: 'Ready to place',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'ready_to_place' }),
          newTab: false,
        },
      ])
    })

    it('returns the "unallocated" action for an assessment with a status of "rejected"', () => {
      const assessment = assessmentFactory.build({
        status: 'rejected',
      })

      const result = assessmentActions(assessment)

      expect(result).toEqual([
        {
          text: 'Unallocated',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'unallocated' }),
          newTab: false,
        },
      ])
    })
  })
})
