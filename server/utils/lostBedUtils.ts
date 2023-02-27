import type { TemporaryAccommodationLostBed as LostBed } from '@approved-premises/api'

export const allStatuses: Array<{ name: string; id: LostBed['status']; tagClass: string }> = [
  {
    name: 'Active',
    id: 'active',
    tagClass: 'govuk-tag--blue',
  },
  {
    name: 'Cancelled',
    id: 'cancelled',
    tagClass: 'govuk-tag--red',
  },
]

export function statusTag(statusId: LostBed['status'], context: 'bookingsAndVoids' | 'voidsOnly') {
  if (context === 'bookingsAndVoids') {
    return `<strong class="govuk-tag govuk-tag--red">Void</strong>`
  }
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}
