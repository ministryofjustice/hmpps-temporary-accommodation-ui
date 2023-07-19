import { TemporaryAccommodationAssessmentSummary as AssessmentSummary } from '@approved-premises/api'
import { TableRow } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from './dateUtils'

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
