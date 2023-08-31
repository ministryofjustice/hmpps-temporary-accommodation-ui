import { TemporaryAccommodationAssessmentSummary as AssessmentSummary } from '../@types/shared'

export const allStatuses: Array<{ name: string; id: AssessmentSummary['status']; tagClass: string }> = [
  {
    name: 'Archived',
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
