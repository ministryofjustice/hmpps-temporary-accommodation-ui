import {
  TemporaryAccommodationAssessment as Assessment,
  AssessmentSortField,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
  ReferralHistorySystemNote,
  SortDirection,
  ReferralHistorySystemNote as SystemNote,
  ReferralHistoryUserNote as UserNote,
} from '@approved-premises/api'
import QueryString from 'qs'
import {
  AssessmentSearchApiStatus,
  AssessmentSearchParameters,
  AssessmentUpdatableDateField,
  ErrorSummary,
  MessageContents,
  ReferenceData,
  TableRow,
  TimelineItem,
} from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from './dateUtils'
import { personName } from './personUtils'
import { addPlaceContext, addPlaceContextFromAssessmentId, createPlaceContext } from './placeUtils'
import { assertUnreachable, convertToTitleCase } from './utils'
import { formatLines } from './viewUtils'
import { statusName, statusTag } from './assessmentStatusUtils'
import { sortHeader } from './sortHeader'
import { SanitisedError } from '../sanitisedError'
import { insertBespokeError, insertGenericError } from './validation'

export const assessmentTableRows = (assessmentSummary: AssessmentSummary, showStatus: boolean = false): TableRow => {
  const row = [
    htmlValue(
      `<a href="${paths.assessments.summary({ id: assessmentSummary.id })}">${personName(
        assessmentSummary.person,
        'Limited access offender',
      )}</a><div class="govuk-body govuk-!-margin-bottom-0"> ${assessmentSummary.person.crn}</div>`,
      personName(assessmentSummary.person, ''),
    ),
    textValue(assessmentSummary.probationDeliveryUnitName),
    dateValue(assessmentSummary.createdAt),
    dateValue(assessmentSummary.arrivalDate),
  ]

  if (showStatus) {
    row.push(htmlValue(statusTag(assessmentSummary.status), statusName(assessmentSummary.status)))
  }

  return row
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string, sortValue: string) => {
  return {
    html: value,
    attributes: {
      'data-sort-value': sortValue,
    },
  }
}

const dateValue = (date: string) => {
  return {
    text: DateFormats.isoDateToUIDate(date, { format: 'short' }),
    attributes: {
      'data-sort-value': date,
    },
  }
}

export const assessmentActions = (assessment: Assessment) => {
  const items = []

  const actions = {
    unallocated: {
      text: 'Unallocated',
      classes: 'govuk-button--secondary',
      href: paths.assessments.update({ id: assessment.id, status: 'unallocated' }),
    },
    inReview: {
      text: 'In review',
      classes: 'govuk-button--secondary',
      href: paths.assessments.update({ id: assessment.id, status: 'in_review' }),
    },
    reject: {
      text: 'Reject',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
    },
    readyToPlace: {
      text: 'Ready to place',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'ready_to_place' }),
    },
    close: {
      text: 'Archive',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'closed' }),
    },
    findABedspace: {
      classes: 'govuk-button--secondary',
      href: addPlaceContext(paths.bedspaces.search({}), createPlaceContext(assessment)),
      text: 'Place referral',
    },
  }

  switch (assessment.status) {
    case 'unallocated':
      items.push(actions.inReview, actions.reject)
      break
    case 'in_review':
      items.push(actions.readyToPlace, actions.unallocated, actions.reject)
      break
    case 'ready_to_place':
      items.push(actions.close, actions.inReview, actions.reject, actions.findABedspace)
      break
    case 'rejected':
      items.push(actions.unallocated)
      break
    case 'closed':
      items.push(actions.readyToPlace)
      break
    default:
      break
  }

  if (items.length === 0) {
    return null
  }

  return items
}

export const timelineItems = (assessment: Assessment): Array<TimelineItem> => {
  const notes = [...assessment.referralHistoryNotes].sort((noteA, noteB) => {
    if (noteA.createdAt === noteB.createdAt) {
      return 0
    }

    return noteA.createdAt < noteB.createdAt ? 1 : -1
  })

  return notes.map(note => {
    return {
      label: {
        text: isUserNote(note) ? 'Note' : systemNoteLabelText(note),
      },
      html: renderNote(note),
      datetime: {
        timestamp: note.createdAt,
        type: 'datetime',
      },
      byline: { text: convertToTitleCase(note.createdByUserName) },
    }
  })
}

export const referralRejectionReasonIsOther = (
  id: string,
  match: string,
  referralRejectionReasons: Array<ReferenceData>,
) => Boolean(referralRejectionReasons.find(reason => reason.id === id)?.name === match)

export const statusChangeMessage = (assessmentId: string, status: AssessmentStatus): MessageContents => {
  switch (status) {
    case 'closed':
      return 'This referral has been archived'
    case 'in_review':
      return 'This referral is in review'
    case 'ready_to_place':
      return {
        title: 'This referral is ready to place',
        html: `<a class="govuk-link" href="${addPlaceContextFromAssessmentId(
          paths.bedspaces.search({}),
          assessmentId,
        )}" rel="noreferrer noopener" target="_blank">Place referral (opens in new tab)</a>`,
      }
    case 'rejected':
      return {
        title: 'This referral has been rejected',
        html: `It's been moved to archived referrals. You now need to email the probation practitioner to tell them it's been rejected.<br><br><a class="govuk-link" href="${paths.assessments.index(
          {},
        )}">Return to the referrals dashboard</a>`,
      }
    case 'unallocated':
      return {
        title: 'This referral has been unallocated',
        html: `<a class="govuk-link" href="${paths.assessments.confirm({
          id: assessmentId,
          status: 'in_review',
        })}">Mark as in review</a> if you are working on this referral`,
      }
    default:
      return assertUnreachable(status)
  }
}

const isUserNote = (note: UserNote | SystemNote): note is UserNote => {
  return note.type === 'user'
}

const isSystemNoteWithDetails = (note: UserNote | SystemNote): note is ReferralHistorySystemNote => {
  return Boolean(note.type === 'system' && note.messageDetails)
}

export const renderSystemNote = (note: ReferralHistorySystemNote): TimelineItem['html'] => {
  const reason = note.messageDetails.rejectionReasonDetails || note.messageDetails.rejectionReason
  const isWithdrawn = note.messageDetails.isWithdrawn ? 'Yes' : 'No'

  const lines = [`Rejection reason: ${reason}`, `Withdrawal requested by the probation practitioner: ${isWithdrawn}`]

  return formatLines(lines.join('\n\n'))
}

export const renderNote = (note: UserNote | SystemNote): TimelineItem['html'] => {
  if (isSystemNoteWithDetails(note)) {
    return renderSystemNote(note)
  }

  if (isUserNote(note)) {
    return formatLines(note.message)
  }

  return undefined
}

const systemNoteLabelText = (note: SystemNote): TimelineItem['label']['text'] => {
  switch (note.category) {
    case 'submitted':
      return 'Referral submitted'
    case 'unallocated':
      return 'Referral marked as unallocated'
    case 'in_review':
      return 'Referral marked as in review'
    case 'ready_to_place':
      return 'Referral marked as ready to place'
    case 'rejected':
      return 'Referral marked as rejected'
    case 'completed':
      return 'Referral marked as closed'
    default:
      return assertUnreachable(note.category)
  }
}
export const createTableHeadings = (
  currentSortBy: AssessmentSortField,
  sortIsAscending: boolean,
  href: string,
  includeStatusColumn: boolean = false,
) => {
  const headings = [
    sortHeader('Name / CRN', 'name', currentSortBy, sortIsAscending, href),
    sortHeader('PDU (Probation Delivery Unit)', 'probationDeliveryUnitName', currentSortBy, sortIsAscending, href),
    sortHeader('Referral received', 'createdAt', currentSortBy, sortIsAscending, href),
    sortHeader('Bedspace required', 'arrivedAt', currentSortBy, sortIsAscending, href),
  ]

  if (includeStatusColumn) {
    headings.push(sortHeader('Status', 'status', currentSortBy, sortIsAscending, href))
  }

  return headings
}
export const getParams = (query?: QueryString.ParsedQs): AssessmentSearchParameters => ({
  // Default is page 1, sorted by name ascending
  ...query,
  page: Number(!query.page ? 1 : query.page),
  sortBy: (query.sortBy || 'arrivedAt') as AssessmentSortField,
  sortDirection: (query.sortDirection || 'asc') as SortDirection,
})

export const pathFromStatus = (status: AssessmentSearchApiStatus) => {
  let pathStatus: string = status

  if (status === 'in_review') pathStatus = 'inReview'
  if (status === 'ready_to_place') pathStatus = 'readyToPlace'
  if (status === 'archived') pathStatus = 'archive'

  return paths.assessments[pathStatus]({})
}

export const insertUpdateDateError = (err: SanitisedError, assessmentId: string) => {
  const { detail } = err.data as { detail: string }
  const errorSummary: ErrorSummary[] = []
  let errorType: string
  let dateField: AssessmentUpdatableDateField

  if (detail.match('Release date cannot be after accommodation required from date')) {
    const requiredFromDate = detail.split(':')[1].trim()
    errorSummary.push({
      html: `Enter a date which is on or before when accommodation is required from (${DateFormats.isoDateToUIDate(
        requiredFromDate,
      )}). You can <a class="govuk-link" href="${paths.assessments.changeDate.accommodationRequiredFromDate({
        id: assessmentId,
      })}">edit the ‘accommodation required from’ date</a>`,
    })
    dateField = 'releaseDate'
    errorType = 'afterAccommodationRequiredFromDate'
  }

  if (detail.match('Accommodation required from date cannot be before release date')) {
    const releaseDate = detail.split(':')[1].trim()
    errorSummary.push({
      html: `Enter a date which is on or after the release date (${DateFormats.isoDateToUIDate(
        releaseDate,
      )}). You can <a class="govuk-link" href="${paths.assessments.changeDate.releaseDate({
        id: assessmentId,
      })}">edit the release date</a>`,
    })
    dateField = 'accommodationRequiredFromDate'
    errorType = 'beforeReleaseDate'
  }

  if (errorSummary.length && errorType) {
    insertBespokeError(err, {
      errorTitle: 'There is a problem',
      errorSummary,
    })
    insertGenericError(err, dateField, errorType)
  }
}

type ChangeDatePageContent = {
  docTitle: string
  title: string
  hint?: string
}

export const changeDatePageContent = (
  dateField: AssessmentUpdatableDateField,
  assessment: Assessment,
): ChangeDatePageContent => {
  if (dateField === 'releaseDate') {
    return {
      docTitle: 'Change release date',
      title: `What is ${personName(assessment.application.person)}'s release date?`,
      hint: 'This could include the release date from custody, an Approved Premises, or CAS2 (formerly Bail Accommodation Support Services)',
    }
  }

  return {
    docTitle: 'Change date accommodation is required from',
    title: 'What date is accommodation required from?',
  }
}
