import {
  Cas3Bedspace,
  Cas3BedspaceArchiveAction,
  Cas3BedspaceStatus,
  Cas3Premises,
  Characteristic,
} from '@approved-premises/api'
import { BedspaceStatus, PageHeadingBarItem, PlaceContext, SummaryList } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'
import { DateFormats, dateIsInFuture } from './dateUtils'
import config from '../config'
import { convertToTitleCase } from './utils'

export function bedspaceActions(
  premises: Cas3Premises,
  bedspace: Cas3Bedspace,
  placeContext: PlaceContext,
): Array<PageHeadingBarItem> {
  if (bedspace.status === 'online') {
    return onlineBedspaceActions(premises, bedspace, placeContext)
  }
  if (bedspace.status === 'archived') {
    return archivedBedspaceActions(premises, bedspace, placeContext)
  }
  return upcomingBedspaceActions(premises, bedspace, placeContext)
}

const archivedBedspaceActions = (
  premises: Cas3Premises,
  bedspace: Cas3Bedspace,
  placeContext: PlaceContext,
): Array<PageHeadingBarItem> => {
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
    href: addPlaceContext(
      paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
      placeContext,
    ),
    classes: 'govuk-button--secondary',
  })
  return actions
}

const upcomingBedspaceActions = (
  premises: Cas3Premises,
  bedspace: Cas3Bedspace,
  placeContext: PlaceContext,
): Array<PageHeadingBarItem> => {
  const actions: Array<PageHeadingBarItem> = []

  if (bedspace.archiveHistory.length >= 1) {
    if (config.flags.cancelScheduledArchiveEnabled) {
      actions.push({
        text: 'Cancel scheduled bedspace online date',
        href: paths.premises.bedspaces.cancelUnarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    }
  }
  actions.push({
    text: 'Edit bedspace details',
    href: addPlaceContext(
      paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
      placeContext,
    ),
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
    href: addPlaceContext(
      paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
      placeContext,
    ),
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

export const summaryList = (bedspace: Cas3Bedspace): SummaryList => {
  const rows = [
    {
      key: { text: 'Bedspace status' },
      value: { html: formatBedspaceStatus(bedspace) },
    },
    {
      key: { text: 'Start date' },
      value: { text: formatBedspaceDate(bedspace.startDate) },
    },
  ]

  if (bedspace.archiveHistory && bedspace.archiveHistory.length > 0) {
    rows.push({
      key: { text: 'Archive history' },
      value: {
        html: formatArchiveHistory(bedspace.archiveHistory),
      },
    })
  }

  rows.push(
    {
      key: { text: 'Bedspace details' },
      value: { html: formatBedspaceDetails(bedspace.characteristics) || 'None' },
    },
    {
      key: { text: 'Additional bedspace details' },
      value: { html: formatNotes(bedspace.notes ?? 'None') },
    },
  )
  return {
    rows,
  }
}

const getBedspaceStatusTagColour = (status: Cas3BedspaceStatus): string => {
  switch (status) {
    case 'online':
      return 'govuk-tag--green'
    case 'archived':
      return 'govuk-tag--grey'
    case 'upcoming':
      return 'govuk-tag--blue'
    default:
      return 'govuk-tag--grey'
  }
}

const formatBedspaceStatus = (bedspace: Cas3Bedspace): string => {
  const tagClass = getBedspaceStatusTagColour(bedspace.status)
  let html = `<strong class="govuk-tag ${tagClass}">${convertToTitleCase(bedspace.status)}</strong>`

  if (bedspace.status === 'online' && bedspace.endDate) {
    html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled archive date ${formatBedspaceDate(bedspace.endDate)}</span>`
  } else if (bedspace.status === 'archived' && new Date(bedspace.scheduleUnarchiveDate) > new Date()) {
    html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled online date ${formatBedspaceDate(bedspace.scheduleUnarchiveDate)}</span>`
  }

  return html
}

const formatBedspaceDate = (dateString: string | undefined | null): string => {
  if (dateString === undefined || dateString === null || dateString === '') {
    return ''
  }

  return DateFormats.isoDateToUIDate(dateString)
}

const formatBedspaceDetails = (characteristics: Array<Characteristic>): string => {
  return (characteristics || [])
    .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
    .join(' ')
}

const formatArchiveHistory = (archiveHistory: Array<Cas3BedspaceArchiveAction>): string => {
  return archiveHistory
    .map(action => {
      const verb = action.status === 'archived' ? 'Archive' : convertToTitleCase(action.status)
      return `<div>${verb} date ${formatBedspaceDate(action.date)}</div>`
    })
    .join('')
}

export const summaryListForBedspaceStatus = (bedspace: Cas3Bedspace): SummaryList => {
  let endDate = 'No end date added'

  if (bedspace.endDate) {
    endDate = DateFormats.isoDateToUIDate(bedspace.endDate)

    if (bedspaceStatus(bedspace) === 'online') {
      endDate += ` (${DateFormats.isoDateToDaysFromNow(bedspace.endDate)})`
    }
  }

  return {
    rows: [
      {
        key: textValue('Bedspace status'),
        value: htmlValue(
          bedspaceStatus(bedspace) === 'online'
            ? `<span class="govuk-tag govuk-tag--green">Online</span>`
            : `<span class="govuk-tag govuk-tag--grey">Archived</span>`,
        ),
      },
      {
        key: textValue('Bedspace end date'),
        value: textValue(endDate),
      },
    ],
  }
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}

const formatNotes = (notes: string): string => notes.replace(/\n/g, '<br />')
