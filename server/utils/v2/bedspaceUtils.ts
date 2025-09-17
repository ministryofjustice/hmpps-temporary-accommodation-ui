import { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import { BedspaceStatus, PageHeadingBarItem, PlaceContext } from '@approved-premises/ui'
import paths from '../../paths/temporary-accommodation/manage'
import { addPlaceContext } from '../placeUtils'
import { dateIsInFuture } from '../dateUtils'
import config from '../../config'

export function bedspaceActions(
  premises: Cas3Premises,
  bedspace: Cas3Bedspace,
  placeContext: PlaceContext,
): Array<PageHeadingBarItem> {
  if (bedspace.status === 'online') {
    return onlineBedspaceActions(premises, bedspace, placeContext)
  }
  if (bedspace.status === 'archived') {
    return archivedBedspaceActions(premises, bedspace)
  }
  return upcomingBedspaceActions(premises, bedspace)
}

const archivedBedspaceActions = (premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = []

  if (!bedspace.scheduleUnarchiveDate) {
    actions.push({
      text: 'Make bedspace online',
      href: paths.premises.bedspaces.unarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
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

const upcomingBedspaceActions = (premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = []

  if (config.flags.cancelScheduledArchiveEnabled && bedspace.archiveHistory.length >= 1) {
    actions.push({
      text: 'Cancel scheduled bedspace online date',
      href: paths.premises.bedspaces.cancelUnarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
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

const onlineBedspaceActions = (
  premises: Cas3Premises,
  bedspace: Cas3Bedspace,
  placeContext: PlaceContext,
): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = [
    {
      text: 'Book bedspace',
      href: addPlaceContext(paths.bookings.new({ premisesId: premises.id, bedspaceId: bedspace.id }), placeContext),
      classes: 'govuk-button--secondary',
    },
    {
      text: 'Void bedspace',
      href: paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }),
      classes: 'govuk-button--secondary',
    },
  ]
  if (bedspace.endDate) {
    if (config.flags.cancelScheduledArchiveEnabled) {
      actions.push({
        text: 'Cancel scheduled bedspace archive',
        href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    }
  } else {
    actions.push({
      text: 'Archive bedspace',
      href: paths.premises.bedspaces.archive({ premisesId: premises.id, bedspaceId: bedspace.id }),
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

export function bedspaceStatus(bedspace: Cas3Bedspace): BedspaceStatus {
  if (bedspace.endDate) {
    if (!dateIsInFuture(bedspace.endDate)) {
      return 'archived'
    }
  }

  return 'online'
}

export function setDefaultStartDate(userInput: Record<string, unknown>) {
  const today = new Date()
  if (!userInput['startDate-day'] && !userInput['startDate-month'] && !userInput['startDate-year']) {
    userInput['startDate-day'] = String(today.getDate())
    userInput['startDate-month'] = String(today.getMonth() + 1)
    userInput['startDate-year'] = String(today.getFullYear())
  }
}
