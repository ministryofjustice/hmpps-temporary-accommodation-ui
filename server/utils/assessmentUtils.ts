import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
  ReferralHistoryNote as Note,
  ReferralHistorySystemNote as SystemNote,
  ReferralHistoryUserNote as UserNote,
} from '@approved-premises/api'
import { MessageContents, TableRow, TimelineItem } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from './dateUtils'
import { personName } from './personUtils'
import { addPlaceContext, addPlaceContextFromAssessmentId, createPlaceContext } from './placeUtils'
import { assertUnreachable, convertToTitleCase } from './utils'
import { formatLines } from './viewUtils'
import { statusName, statusTag } from './assessmentStatusUtils'

export const assessmentTableRows = (assessmentSummary: AssessmentSummary, showStatus: boolean = false): TableRow => {
  const row = [
    htmlValue(
      `<a href="${paths.assessments.summary({ id: assessmentSummary.id })}">${personName(
        assessmentSummary.person,
        'Limited access offender',
      )}</a>`,
      personName(assessmentSummary.person, ''),
    ),
    textValue(assessmentSummary.person.crn),
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
      newTab: false,
    },
    inReview: {
      text: 'In review',
      classes: 'govuk-button--secondary',
      href: paths.assessments.update({ id: assessment.id, status: 'in_review' }),
      newTab: false,
    },
    reject: {
      text: 'Reject',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'rejected' }),
      newTab: false,
    },
    readyToPlace: {
      text: 'Ready to place',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'ready_to_place' }),
      newTab: false,
    },
    close: {
      text: 'Close',
      classes: 'govuk-button--secondary',
      href: paths.assessments.confirm({ id: assessment.id, status: 'closed' }),
      newTab: false,
    },
    findABedspace: {
      classes: 'govuk-button--secondary',
      href: addPlaceContext(paths.bedspaces.search({}), createPlaceContext(assessment)),
      text: 'Place referral',
      newTab: true,
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
      ...(isUserNote(note) ? { html: userNoteHtml(note) } : {}),
      datetime: {
        timestamp: note.createdAt,
        type: 'datetime',
      },
      byline: { text: convertToTitleCase(note.createdByUserName) },
    }
  })
}

export const statusChangeMessage = (assessmentId: string, status: AssessmentStatus): MessageContents => {
  switch (status) {
    case 'closed':
      return 'This referral has been closed'
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
        html: `<a class="govuk-link" href="${paths.assessments.index({})}">Return to the referrals dashboard</a>`,
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

const isUserNote = (note: Note): note is UserNote => {
  return note.type === 'user'
}

const userNoteHtml = (note: UserNote) => formatLines(note.message)

const systemNoteLabelText = (note: SystemNote) => {
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
