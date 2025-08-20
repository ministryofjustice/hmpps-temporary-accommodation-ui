import { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../../paths/temporary-accommodation/manage'

export function bedspaceActions(premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> {
  return bedspace.status === 'online'
    ? onlineBedspaceActions(premises, bedspace)
    : archivedBedspaceActions(premises, bedspace)
}

const archivedBedspaceActions = (premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = []

  if (bedspace.startDate && new Date(bedspace.startDate) > new Date()) {
    actions.push({
      text: 'Cancel scheduled bedspace online date',
      href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
      classes: 'govuk-button--secondary',
    })
  } else {
    actions.push({
      text: 'Make bedspace online',
      href: '#',
      classes: 'govuk-button--secondary',
    })
  }

  actions.push({
    text: 'Edit bedspace details',
    href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
    classes: 'govuk-button--secondary',
  })
  return actions
}

const onlineBedspaceActions = (premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = [
    {
      text: 'Book bedspace',
      href: paths.bookings.new({ premisesId: premises.id, roomId: bedspace.id }),
      classes: 'govuk-button--secondary',
    },
    {
      text: 'Void bedspace',
      href: paths.lostBeds.new({ premisesId: premises.id, roomId: bedspace.id }),
      classes: 'govuk-button--secondary',
    },
  ]
  if (bedspace.endDate) {
    actions.push({
      text: 'Cancel scheduled bedspace archive',
      href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
      classes: 'govuk-button--secondary',
    })
  } else {
    actions.push({
      text: 'Archive bedspace',
      href: paths.premises.v2.bedspaces.archive({ premisesId: premises.id, bedspaceId: bedspace.id }),
      classes: 'govuk-button--secondary',
    })
  }
  actions.push({
    text: 'Edit bedspace details',
    href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
    classes: 'govuk-button--secondary',
  })
  return actions
}
