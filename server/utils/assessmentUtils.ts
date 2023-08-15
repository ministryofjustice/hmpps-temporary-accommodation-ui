import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '@approved-premises/api'
import { TableRow } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from './dateUtils'
import { addPlaceContext, createPlaceContext } from './placeUtils'

export const allStatuses: Array<{ name: string; id: AssessmentSummary['status']; tagClass: string }> = [
  {
    name: 'Closed',
    id: 'closed',
    tagClass: 'govuk-tag--blue',
  },
  {
    name: 'In review',
    id: 'in_review',
    tagClass: 'govuk-tag--grey',
  },
  {
    name: 'Ready to place',
    id: 'ready_to_place',
    tagClass: 'govuk-tag--grey',
  },
  {
    name: 'Rejected',
    id: 'rejected',
    tagClass: 'govuk-tag--red',
  },
  {
    name: 'Unallocated',
    id: 'unallocated',
    tagClass: 'govuk-tag--grey',
  },
]

export const statusTag = (statusId: AssessmentSummary['status']) => {
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}

export const statusName = (statusId: AssessmentSummary['status']) => {
  const status = allStatuses.find(({ id }) => id === statusId)
  return status.name
}

export const assessmentTableRows = (assessmentSummary: AssessmentSummary, showStatus: boolean = false): TableRow => {
  const row = [
    htmlValue(
      `<a href="${paths.assessments.show({ id: assessmentSummary.id })}">${assessmentSummary.person.name}</a>`,
      assessmentSummary.person.name,
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
