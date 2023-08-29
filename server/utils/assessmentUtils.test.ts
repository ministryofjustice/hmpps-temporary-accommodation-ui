import paths from '../paths/temporary-accommodation/manage'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  personFactory,
  placeContextFactory,
  referralHistorySystemNoteFactory,
  referralHistoryUserNoteFactory,
  restrictedPersonFactory,
} from '../testutils/factories'
import { assessmentActions, assessmentTableRows, statusName, statusTag, timelineItems } from './assessmentUtils'
import { addPlaceContext, createPlaceContext } from './placeUtils'
import { formatLines } from './viewUtils'

jest.mock('./viewUtils')
jest.mock('./userUtils')
jest.mock('./placeUtils')

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

    it('returns a table row for the given assessment summary for the assessments table when the person is a LAO', () => {
      const assessmentSummary = assessmentSummaryFactory.build({
        id: 'some-id',
        person: restrictedPersonFactory.build(),
      })

      const result = assessmentTableRows(assessmentSummary)

      expect(result).toEqual(
        expect.arrayContaining([
          {
            html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">Limited access offender</a>`,
            attributes: { 'data-sort-value': '' },
          },
        ]),
      )
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

      const placeContext = placeContextFactory.build()

      ;(createPlaceContext as jest.MockedFunction<typeof createPlaceContext>).mockReturnValue(placeContext)
      ;(addPlaceContext as jest.MockedFunction<typeof addPlaceContext>).mockReturnValue('/path/with/place/context')

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
          href: '/path/with/place/context',
          text: 'Place referral',
          newTab: true,
        },
      ])

      expect(createPlaceContext).toHaveBeenCalledWith(assessment)
      expect(addPlaceContext).toHaveBeenCalledWith(paths.bedspaces.search({}), placeContext)
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

  describe('timelineItems', () => {
    it('returns a notes in a format compatible with the MoJ timeline component', () => {
      const userNote1 = referralHistoryUserNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-04-01',
      })
      const userNote2 = referralHistoryUserNoteFactory.build({
        createdByUserName: 'ANOTHER USER',
        createdAt: '2024-05-01',
      })

      const systemNote1 = referralHistorySystemNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-04-02',
        category: 'in_review',
      })
      const systemNote2 = referralHistorySystemNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-05-02',
        category: 'ready_to_place',
      })

      const notes = [systemNote1, systemNote2, userNote2, userNote1]

      const assessment = assessmentFactory.build({ referralHistoryNotes: notes })
      const userNoteHtml = 'some formatted html'

      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(_text => userNoteHtml)
      const result = timelineItems(assessment)

      expect(result).toEqual([
        {
          label: {
            text: 'Referral marked as ready to place',
          },
          datetime: {
            timestamp: systemNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Note',
          },
          html: userNoteHtml,
          datetime: {
            timestamp: userNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Another User',
          },
        },
        {
          label: {
            text: 'Referral marked as in review',
          },
          datetime: {
            timestamp: systemNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Note',
          },
          html: userNoteHtml,
          datetime: {
            timestamp: userNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
      ])
    })
  })
})
