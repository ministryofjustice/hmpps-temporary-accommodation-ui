import { AssessmentSearchApiStatus } from '@approved-premises/ui'
import {
  ReferralHistoryDomainEventNote as DomainEventNote,
  ReferralHistoryNoteMessageDetails,
} from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import paths from '../paths/temporary-accommodation/manage'
import {
  applicationFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  personFactory,
  placeContextFactory,
  referenceDataFactory,
  referralHistoryDomainEventNoteFactory,
  referralHistorySystemNoteFactory,
  referralHistoryUserNoteFactory,
  restrictedPersonFactory,
} from '../testutils/factories'
import * as validation from './validation'
import {
  assessmentActions,
  assessmentTableRows,
  changeDatePageContent,
  createTableHeadings,
  getParams,
  insertUpdateDateError,
  pathFromStatus,
  referralRejectionReasonIsOther,
  renderDomainEventNote,
  renderNote,
  renderSystemNote,
  statusChangeMessage,
  timelineItems,
} from './assessmentUtils'
import * as assessmentUtils from './assessmentUtils'
import * as viewUtils from './viewUtils'
import { addPlaceContext, addPlaceContextFromAssessmentId, createPlaceContext } from './placeUtils'
import { DateFormats } from './dateUtils'

jest.mock('./userUtils')
jest.mock('./placeUtils')

afterEach(() => {
  jest.restoreAllMocks()
})

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
          html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">John Smith</a><div class="govuk-body govuk-!-margin-bottom-0"> ABC123</div>`,
          attributes: { 'data-sort-value': 'John Smith' },
        },
        { text: assessmentSummary.probationDeliveryUnitName },
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
            html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">Limited access offender</a><div class="govuk-body govuk-!-margin-bottom-0"> ${assessmentSummary.person.crn}</div>`,
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
          html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">John Smith</a><div class="govuk-body govuk-!-margin-bottom-0"> ABC123</div>`,
          attributes: { 'data-sort-value': 'John Smith' },
        },
        { text: assessmentSummary.probationDeliveryUnitName },
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

    it('returns a table row for the given assessment summary for the assessments table when the referral has no PDU', () => {
      const assessmentSummary = assessmentSummaryFactory.build({
        id: 'some-id',
        person: personFactory.build({
          name: 'John Smith',
          crn: 'ABC123',
        }),
        arrivalDate: '2023-04-13',
        createdAt: '2023-02-27',
        status: 'unallocated',
        probationDeliveryUnitName: undefined,
      })

      const result = assessmentTableRows(assessmentSummary, true)

      expect(result).toEqual([
        {
          html: `<a href="${paths.assessments.summary({ id: 'some-id' })}">John Smith</a><div class="govuk-body govuk-!-margin-bottom-0"> ABC123</div>`,
          attributes: { 'data-sort-value': 'John Smith' },
        },
        { text: undefined },
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

  describe('renderNote', () => {
    it('renders the contents of a user note with paragraphs and line breaks', () => {
      jest.spyOn(viewUtils, 'formatLines').mockReturnValue('formatted lines')
      const note = referralHistoryUserNoteFactory.build({
        message: 'message contents',
      })

      const result = renderNote(note)

      expect(result).toEqual('formatted lines')
      expect(viewUtils.formatLines).toHaveBeenCalledWith('message contents')
    })

    it('renders the contents of a system note with message details', () => {
      jest.spyOn(assessmentUtils, 'renderSystemNote').mockReturnValue('formatted message')
      const note = referralHistorySystemNoteFactory.build({
        message: '',
        messageDetails: {
          foo: 'bar',
        } as ReferralHistoryNoteMessageDetails,
      })

      const result = renderNote(note)

      expect(result).toEqual('formatted message')
      expect(assessmentUtils.renderSystemNote).toHaveBeenCalledWith(note)
    })

    it('renders the contents of a domain event note with details', () => {
      jest.spyOn(assessmentUtils, 'renderDomainEventNote').mockReturnValue('formatted message')
      const note: DomainEventNote = {
        id: faker.string.uuid(),
        createdByUserName: faker.person.fullName(),
        createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
        type: 'domainEvent',
        message: '',
        messageDetails: {
          domainEvent: { foo: 'bar' },
        } as ReferralHistoryNoteMessageDetails,
      }

      const result = renderNote(note)

      expect(result).toEqual('formatted message')
      expect(assessmentUtils.renderDomainEventNote).toHaveBeenCalledWith(note.messageDetails)
    })

    it('returns undefined for a system note with no message details', () => {
      const note = referralHistorySystemNoteFactory.build({
        message: '',
        messageDetails: undefined,
      })

      expect(renderNote(note)).toBeUndefined()
    })
  })

  describe('renderSystemNote', () => {
    describe('for a rejection note', () => {
      it('returns HTML for a standard rejection reason', () => {
        const note = referralHistorySystemNoteFactory.build({
          category: 'rejected',
          message: '',
          messageDetails: {
            rejectionReason: 'A standard reason',
            isWithdrawn: true,
          },
        })

        const result = renderSystemNote(note)

        expect(result).toEqual(
          '<p>Rejection reason: A standard reason</p><p>Withdrawal requested by the probation practitioner: Yes</p>',
        )
      })

      it('returns HTML with user provided details for a another rejection reason', () => {
        const note = referralHistorySystemNoteFactory.build({
          category: 'rejected',
          message: '',
          messageDetails: {
            rejectionReason: 'Another reason (please add)',
            rejectionReasonDetails: 'Some details',
            isWithdrawn: false,
          },
        })

        const result = renderSystemNote(note)

        expect(result).toEqual(
          '<p>Rejection reason: Some details</p><p>Withdrawal requested by the probation practitioner: No</p>',
        )
      })
    })
  })

  describe('renderDomainEventDetails', () => {
    describe('when "Accommodation required from date" has been updated', () => {
      it('returns HTML for a standard rejection reason', () => {
        const messageDetails: DomainEventNote['messageDetails'] = {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            updatedFields: [
              {
                fieldName: 'accommodationRequiredFromDate',
                updatedTo: '2125-11-01',
                updatedFrom: '2125-01-31',
              },
            ],
          },
        }

        const result = renderDomainEventNote(messageDetails)

        expect(result).toEqual(
          '<p>Accommodation required from date was changed from 31 January 2125 to 1 November 2125</p>',
        )
      })
    })

    describe('when "Release date" has been updated', () => {
      it('returns HTML for a standard rejection reason', () => {
        const messageDetails: DomainEventNote['messageDetails'] = {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            updatedFields: [
              {
                fieldName: 'releaseDate',
                updatedTo: '2125-11-01',
                updatedFrom: '2125-01-31',
              },
            ],
          },
        }

        const result = renderDomainEventNote(messageDetails)

        expect(result).toEqual('<p>Release date was changed from 31 January 2125 to 1 November 2125</p>')
      })
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

      const domainEventNote1 = referralHistoryDomainEventNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-06-02',
        messageDetails: {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
            updatedFields: [
              {
                fieldName: 'accommodationRequiredFromDate',
                updatedTo: '2025-09-02',
                updatedFrom: '2123-09-02',
              },
            ],
          },
        },
      })

      const domainEventNote2 = referralHistoryDomainEventNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-06-01',
        messageDetails: {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
            updatedFields: [
              {
                fieldName: 'releaseDate',
                updatedTo: '2025-09-02',
                updatedFrom: '2123-09-02',
              },
            ],
          },
        },
      })

      const notes = [systemNote1, systemNote2, userNote2, userNote1, domainEventNote1, domainEventNote2]
      const assessment = assessmentFactory.build({ referralHistoryNotes: notes })
      const userNoteHtml = 'some formatted html'

      jest.spyOn(viewUtils, 'formatLines').mockReturnValue(userNoteHtml)
      const result = timelineItems(assessment)

      expect(result).toEqual([
        {
          label: {
            text: 'Accommodation required from date updated',
          },
          html: '<p>Accommodation required from date was changed from 2 September 2123 to 2 September 2025</p>',
          datetime: {
            timestamp: domainEventNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Release date updated',
          },
          html: '<p>Release date was changed from 2 September 2123 to 2 September 2025</p>',
          datetime: {
            timestamp: domainEventNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
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

  describe('referralRejectionReasonIsOther', () => {
    const rejectionReasons = [
      referenceDataFactory.build({ id: 'another-reason-id', name: 'Another reason' }),
      referenceDataFactory.build({ id: 'other-id', name: 'Other' }),
      referenceDataFactory.build({ id: 'valid-id', name: 'A valid reason' }),
    ]

    it.each([
      [true, 'another-reason-id', 'Another reason'],
      [false, 'other-id', 'Another reason'],
      [false, 'does-not-exist', 'Another reason'],
    ])(`returns %s if the referral rejection id %s reason matches '%s'`, (expected, id, match) => {
      expect(referralRejectionReasonIsOther(id, match, rejectionReasons)).toEqual(expected)
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
      const result = createTableHeadings('probationDeliveryUnitName', true, '?foo=bar')

      expect(result).toEqual([
        {
          html: '<a href="?foo=bar&sortBy=name&sortDirection=asc"><button>Name / CRN</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=probationDeliveryUnitName&sortDirection=desc"><button>PDU (Probation Delivery Unit)</button></a>',
          attributes: { 'aria-sort': 'ascending' },
        },
        {
          html: '<a href="?foo=bar&sortBy=createdAt&sortDirection=asc"><button>Referral received</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=arrivedAt&sortDirection=asc"><button>Bedspace required</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
      ])
    })

    it('returns table headings for archived assessment lists', () => {
      const result = createTableHeadings('status', false, '?foo=bar', true)

      expect(result).toEqual([
        {
          html: '<a href="?foo=bar&sortBy=name&sortDirection=asc"><button>Name / CRN</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=probationDeliveryUnitName&sortDirection=asc"><button>PDU (Probation Delivery Unit)</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=createdAt&sortDirection=asc"><button>Referral received</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?foo=bar&sortBy=arrivedAt&sortDirection=asc"><button>Bedspace required</button></a>',
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

  describe('insertUpdateDateErrors', () => {
    beforeEach(() => {
      jest.spyOn(validation, 'insertBespokeError')
      jest.spyOn(validation, 'insertGenericError')
    })

    it('inserts an error for a release date after the accommodation required date', () => {
      const error = {
        status: 400,
        data: {
          detail: 'Release date cannot be after accommodation required from date: 2024-06-06',
        },
        stack: '',
        message: '',
      }

      insertUpdateDateError(error, 'assessment-id')

      expect(validation.insertBespokeError).toHaveBeenCalledWith(error, {
        errorTitle: 'There is a problem',
        errorSummary: [
          {
            html: `Enter a date which is on or before when accommodation is required from (6 June 2024). You can <a class="govuk-link" href="${paths.assessments.changeDate.accommodationRequiredFromDate(
              { id: 'assessment-id' },
            )}">edit the ‘accommodation required from’ date</a>`,
          },
        ],
      })
      expect(validation.insertGenericError).toHaveBeenCalledWith(
        error,
        'releaseDate',
        'afterAccommodationRequiredFromDate',
      )
    })

    it('inserts an error for an accommodation required from date before the release date', () => {
      const error = {
        status: 400,
        data: {
          detail: 'Accommodation required from date cannot be before release date: 2024-07-07',
        },
        stack: '',
        message: '',
      }

      insertUpdateDateError(error, 'assessment-id')

      expect(validation.insertBespokeError).toHaveBeenCalledWith(error, {
        errorTitle: 'There is a problem',
        errorSummary: [
          {
            html: `Enter a date which is on or after the release date (7 July 2024). You can <a class="govuk-link" href="${paths.assessments.changeDate.releaseDate(
              { id: 'assessment-id' },
            )}">edit the release date</a>`,
          },
        ],
      })
      expect(validation.insertGenericError).toHaveBeenCalledWith(
        error,
        'accommodationRequiredFromDate',
        'beforeReleaseDate',
      )
    })
  })

  describe('changeDatePageContent', () => {
    it('returns page content for a release date change', () => {
      const person = personFactory.build({ name: 'John Foo' })
      const application = applicationFactory.build({ person })
      const assessment = assessmentFactory.build({ application })

      expect(changeDatePageContent('releaseDate', assessment)).toEqual({
        docTitle: 'Change release date',
        title: `What is John Foo's release date?`,
        hint: 'This could include the release date from custody, an Approved Premises, or CAS2 (formerly Bail Accommodation Support Services)',
      })
    })

    it('returns page content for a change of accommodation required from date', () => {
      const assessment = assessmentFactory.build()

      expect(changeDatePageContent('accommodationRequiredFromDate', assessment)).toEqual({
        docTitle: 'Change date accommodation is required from',
        title: `What date is accommodation required from?`,
      })
    })
  })
})
