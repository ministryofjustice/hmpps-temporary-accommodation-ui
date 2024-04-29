import { AssessmentSearchApiStatus } from '@approved-premises/ui'
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
import {
  assessmentActions,
  assessmentTableRows,
  createTableHeadings,
  getParams,
  pathFromStatus,
  statusChangeMessage,
  timelineItems,
} from './assessmentUtils'
import { addPlaceContext, addPlaceContextFromAssessmentId, createPlaceContext } from './placeUtils'
import { formatLines } from './viewUtils'

jest.mock('./viewUtils')
jest.mock('./userUtils')
jest.mock('./placeUtils')

describe('assessmentUtils', () => {
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
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
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
        },
        {
          text: 'Unallocated',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'unallocated' }),
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
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
          text: 'Archive',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'closed' }),
        },
        {
          text: 'In review',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'in_review' }),
        },
        {
          text: 'Reject',
          classes: 'govuk-button--secondary',
          href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
        },
        {
          classes: 'govuk-button--secondary',
          href: '/path/with/place/context',
          text: 'Place referral',
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

  describe('statusChangeMessage', () => {
    it('returns a simple string info message', () => {
      const assessment = assessmentFactory.build({ status: 'in_review' })

      expect(statusChangeMessage(assessment.id, assessment.status)).toEqual('This referral is in review')
    })

    it('returns a title and HTML info message', () => {
      const assessment = assessmentFactory.build({ status: 'rejected' })

      expect(statusChangeMessage(assessment.id, assessment.status)).toEqual({
        title: 'This referral has been rejected',
        html: `It's been moved to archived referrals. You now need to email the probation practitioner to tell them it's been rejected.<br><br><a class="govuk-link" href="${paths.assessments.index(
          {},
        )}">Return to the referrals dashboard</a>`,
      })
    })

    it("returns an info message with a place context for the 'ready to place' status", () => {
      const assessment = assessmentFactory.build({ status: 'ready_to_place' })

      ;(addPlaceContextFromAssessmentId as jest.MockedFunction<typeof addPlaceContextFromAssessmentId>).mockReturnValue(
        '/path/with/place/context',
      )

      expect(statusChangeMessage(assessment.id, assessment.status)).toEqual({
        title: 'This referral is ready to place',
        html: `<a class="govuk-link" href="/path/with/place/context" rel="noreferrer noopener" target="_blank">Place referral (opens in new tab)</a>`,
      })

      expect(addPlaceContextFromAssessmentId).toHaveBeenCalledWith(paths.bedspaces.search({}), assessment.id)
    })
  })

  describe('createTableHeadings', () => {
    it('returns table headings for assessment lists', () => {
      const result = createTableHeadings('crn', true, '?foo=bar')

      expect(result).toEqual([
        {
          html: '<a href="?foo=bar&sortBy=name"><button>Name</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=crn&sortDirection=desc"><button>CRN</button></a>',
          attributes: { 'aria-sort': 'ascending' },
        },
        {
          html: '<a href="?foo=bar&sortBy=createdAt"><button>Referral received</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=arrivedAt"><button>Bedspace required</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
      ])
    })

    it('returns table headings for archived assessment lists', () => {
      const result = createTableHeadings('status', false, '?foo=bar', true)

      expect(result).toEqual([
        {
          html: '<a href="?foo=bar&sortBy=name"><button>Name</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=crn"><button>CRN</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=createdAt"><button>Referral received</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=arrivedAt"><button>Bedspace required</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=status&sortDirection=asc"><button>Status</button></a>',
          attributes: { 'aria-sort': 'descending' },
        },
      ])
    })
  })

  describe('getParams', () => {
    it('applies some defaults', () => {
      expect(getParams({})).toEqual({
        page: 1,
        sortBy: 'arrivedAt',
        sortDirection: 'asc',
      })
    })

    it('returns query values', () => {
      const query = {
        page: '3',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        crn: 'X567345',
      }

      expect(getParams(query)).toEqual({
        crn: 'X567345',
        page: 3,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      })
    })
  })

  describe('pathFromStatus', () => {
    it.each([
      ['/review-and-assess/unallocated', 'unallocated'],
      ['/review-and-assess/in-review', 'in_review'],
      ['/review-and-assess/ready-to-place', 'ready_to_place'],
      ['/review-and-assess/archive', 'archived'],
    ])('returns %s for status %s', (path, status: AssessmentSearchApiStatus) => {
      expect(pathFromStatus(status)).toEqual(path)
    })
  })
})
