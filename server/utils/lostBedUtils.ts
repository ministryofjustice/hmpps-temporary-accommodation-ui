import type { Cas3VoidBedspace, Cas3VoidBedspaceStatus, LostBed } from '@approved-premises/api'
import type { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'

export const allStatuses: Array<{ name: string; id: Cas3VoidBedspaceStatus; tagClass: string }> = [
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

export function statusTag(statusId: Cas3VoidBedspaceStatus, context: 'bookingsAndVoids' | 'voidsOnly') {
  if (context === 'bookingsAndVoids') {
    return `<strong class="govuk-tag govuk-tag--red">Void</strong>`
  }
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}

export function lostBedActions(
  premisesId: string,
  bedspaceId: string,
  lostBed: Cas3VoidBedspace,
): Array<PageHeadingBarItem> {
  if (lostBed.status === 'active') {
    return [
      {
        text: 'Edit this void',
        classes: 'govuk-button--secondary',
        href: paths.lostBeds.edit({ premisesId, bedspaceId, lostBedId: lostBed.id }),
      },
      {
        text: 'Cancel this void',
        classes: 'govuk-button--secondary',
        href: paths.lostBeds.cancellations.new({ premisesId, bedspaceId, lostBedId: lostBed.id }),
      },
    ]
  }
  return null
}

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utilities and all usages
export const isCas3VoidBedspace = (lostBed: LostBed | Cas3VoidBedspace): lostBed is Cas3VoidBedspace =>
  Boolean((lostBed as Cas3VoidBedspace).bedspaceId)

export const lostBedToCas3VoidBedspace = (lostBed: LostBed | Cas3VoidBedspace): Cas3VoidBedspace => {
  if (isCas3VoidBedspace(lostBed)) return lostBed

  const { bedId, bedName, cancellation, costCentre, reason, status, ...sharedProperties } = lostBed

  return {
    ...sharedProperties,
    bedspaceId: bedId,
    bedspaceName: bedName,
    cancellationDate: cancellation?.createdAt,
    cancellationNotes: cancellation?.notes,
    costCentre,
    reason,
    status,
  }
}
