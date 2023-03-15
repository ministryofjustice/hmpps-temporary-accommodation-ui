import type { TemporaryAccommodationLostBed as LostBed } from '@approved-premises/api'
import type { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'

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

export function lostBedActions(premisesId: string, roomId: string, lostBed: LostBed): Array<PageHeadingBarItem> {
  if (lostBed.status === 'active') {
    return [
      {
        text: 'Edit this void',
        classes: 'govuk-button--secondary',
        href: paths.lostBeds.edit({ premisesId, roomId, lostBedId: lostBed.id }),
      },
      {
        text: 'Cancel this void',
        classes: 'govuk-button--secondary',
        href: paths.lostBeds.cancellations.new({ premisesId, roomId, lostBedId: lostBed.id }),
      },
    ]
  }
  return null
}
