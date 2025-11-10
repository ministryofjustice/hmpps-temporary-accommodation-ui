import {
  Cas3BedspacePremisesSearchResult,
  Cas3Premises,
  Cas3PremisesArchiveAction,
  Cas3PremisesBedspaceTotals,
  Cas3PremisesCharacteristic,
  Cas3PremisesSearchResult,
  Cas3PremisesSearchResults,
  Cas3PremisesStatus,
} from '@approved-premises/api'
import {
  PageHeadingBarItem,
  PlaceContext,
  PremisesShowTabs,
  PremisesSortBy,
  type SubNavObj,
  SummaryList,
  TableRow,
} from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'
import config from '../config'
import { convertToTitleCase } from './utils'
import { DateFormats } from './dateUtils'

const ARCHIVE_HISTORY_THRESHOLD = 14

export const shortAddress = (premises: Cas3Premises): string => {
  const elements = [premises.addressLine1, premises.town, premises.postcode].filter(element => !!element)

  return elements.join(', ')
}

export const showPropertySubNavArray = (
  premisesId: string,
  placeContext: PlaceContext,
  activeTab: PremisesShowTabs,
): Array<SubNavObj> => {
  return [
    {
      text: 'Property overview',
      href: addPlaceContext(paths.premises.show({ premisesId }), placeContext),
      active: activeTab === 'premises',
    },
    {
      text: 'Bedspaces overview',
      href: addPlaceContext(paths.premises.bedspaces.list({ premisesId }), placeContext),
      active: activeTab === 'bedspaces',
    },
  ]
}

export const premisesActions = (premises: Cas3Premises, placeContext?: PlaceContext): Array<PageHeadingBarItem> => {
  const editPremisesPath = paths.premises.edit({ premisesId: premises.id })

  const actions = [
    {
      text: 'Edit property details',
      classes: 'govuk-button--secondary',
      href: addPlaceContext(editPremisesPath, placeContext),
    },
  ]

  if (premises.status === 'online') {
    const addBedspacePath = paths.premises.bedspaces.new({ premisesId: premises.id })

    actions.push({
      text: 'Add a bedspace',
      classes: 'govuk-button--secondary',
      href: addPlaceContext(addBedspacePath, placeContext),
    })

    if (premises.endDate) {
      if (config.flags.cancelScheduledArchiveEnabled) {
        actions.push({
          text: 'Cancel scheduled property archive',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelArchive({ premisesId: premises.id }),
        })
      }
    } else {
      actions.push({
        text: 'Archive property',
        classes: 'govuk-button--secondary',
        href: paths.premises.archive({ premisesId: premises.id }),
      })
    }
  } else if (premises.status === 'archived') {
    if (premises.scheduleUnarchiveDate) {
      if (config.flags.cancelScheduledArchiveEnabled) {
        actions.push({
          text: 'Cancel scheduled property online date',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelUnarchive({ premisesId: premises.id }),
        })
      }
    } else {
      actions.push({
        text: 'Make property online',
        classes: 'govuk-button--secondary',
        href: paths.premises.unarchive({ premisesId: premises.id }),
      })
    }
  }

  return actions.sort((a, b) => a.text.localeCompare(b.text))
}

export function isPremiseScheduledToBeArchived(totals: Cas3PremisesBedspaceTotals): boolean {
  if (!totals.premisesEndDate) return false
  const endDate = new Date(totals.premisesEndDate)
  const now = new Date()
  return endDate > now && totals.status !== 'archived'
}

export const tableRows = (
  premises: Cas3PremisesSearchResults,
  placeContext: PlaceContext,
  status: Cas3PremisesStatus,
  premisesSortBy: PremisesSortBy = 'pdu',
): Array<TableRow> => {
  return premises.results === undefined
    ? []
    : premises.results.map(entry => {
        return [
          htmlValue(formatAddress(entry, status)),
          htmlValue(formatBedspaces(entry, placeContext, status)),
          textValue(premisesSortBy === 'pdu' ? entry.pdu : entry.localAuthorityAreaName),
          htmlValue(formatPremisesManageLink(entry, placeContext)),
        ]
      })
}

export const summaryList = (premises: Cas3Premises): SummaryList => {
  const rows = [
    {
      key: { text: 'Property status' },
      value: htmlValue(formatPremisesStatus(premises)),
    },
    {
      key: { text: 'Start date' },
      value: textValue(formatDate(premises.startDate)),
    },
  ]

  if (premises.archiveHistory && premises.archiveHistory.length > 0) {
    rows.push({
      key: { text: 'Archive history' },
      value: {
        html: formatArchiveHistory(premises.archiveHistory),
      },
    })
  }
  rows.push(
    {
      key: { text: 'Address' },
      value: htmlValue(formatAddress(premises)),
    },
    {
      key: { text: 'Local authority' },
      value: textValue(premises.localAuthorityArea?.name ?? ''),
    },
    {
      key: { text: 'Probation region' },
      value: textValue(premises.probationRegion.name),
    },
    {
      key: { text: 'Probation delivery unit' },
      value: textValue(premises.probationDeliveryUnit.name),
    },
    {
      key: { text: 'Expected turn around time' },
      value: textValue(formatTurnaround(premises.turnaroundWorkingDays)),
    },
    {
      key: { text: 'Property details' },
      value: htmlValue(formatDetails(premises.id, premises.premisesCharacteristics)),
    },
    {
      key: { text: 'Additional property details' },
      value: htmlValue(formatNotes(premises.notes || 'None')),
    },
  )
  return {
    rows,
  }
}

export const shortSummaryList = (premises: Cas3Premises): SummaryList => {
  return {
    rows: [
      {
        key: { text: 'Status' },
        value: htmlValue(formatPremisesStatus(premises)),
      },
      {
        key: { text: 'Address' },
        value: htmlValue(formatAddress(premises)),
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

export const formatAddress = (
  premises: {
    addressLine1: string
    addressLine2?: string
    town?: string
    postcode: string
  },
  status: Cas3PremisesStatus = 'online',
): string => {
  const arr = [premises.addressLine1, premises.addressLine2, premises.town, premises.postcode]

  if (status === 'archived') {
    arr.push(
      `<strong class="govuk-tag govuk-tag--grey govuk-!-margin-top-1 govuk-!-margin-bottom-1">${convertToTitleCase(status)}</strong>`,
    )
  }

  return arr
    .filter(line => line !== undefined && line !== null)
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('<br />')
}

const bedspaceUrl = (premisesId: string, bedspaceId: string): string => {
  return paths.premises.bedspaces.show({ premisesId, bedspaceId })
}

const formatPremisesManageLink = (premises: Cas3PremisesSearchResult, placeContext: PlaceContext): string => {
  const hidden = `<span class="govuk-visually-hidden"> property at ${premises.addressLine1}, ${premises.postcode}</span>`
  const premisesUrl = paths.premises.show({ premisesId: premises.id })
  const showPremisesLinkWithPlaceContext = addPlaceContext(premisesUrl, placeContext)
  return `<a href="${showPremisesLinkWithPlaceContext}">Manage${hidden}</a>`
}

const formatBedspace = (
  premisesId: string,
  bedspace: Cas3BedspacePremisesSearchResult,
  placeContext: PlaceContext,
): string => {
  let statusTag = ''
  if (bedspace.status === 'archived') {
    statusTag = ` <strong class="govuk-tag govuk-tag--grey govuk-!-margin-left-2">Archived</strong>`
  } else if (bedspace.status === 'upcoming') {
    statusTag = ` <strong class="govuk-tag govuk-tag--blue govuk-!-margin-left-2">Upcoming</strong>`
  }
  const showBedspaceLinkWithPlaceContext = addPlaceContext(bedspaceUrl(premisesId, bedspace.id), placeContext)
  return `<a href="${showBedspaceLinkWithPlaceContext}">${bedspace.reference}</a>${statusTag}`
}

const formatBedspaces = (
  premises: Cas3PremisesSearchResult,
  placeContext: PlaceContext,
  status: Cas3PremisesStatus,
): string => {
  if (status === 'archived') {
    const bedspaceCount = premises.bedspaces === undefined ? 0 : premises.bedspaces.length

    const count = bedspaceCount === 0 ? 'No' : `${bedspaceCount}`
    const noun = bedspaceCount !== 1 ? 'bedspaces' : 'bedspace'

    return `${count} ${noun}`
  }

  if (premises.bedspaces === undefined || premises.bedspaces.length === 0) {
    return `No bedspaces<br /><a href="${paths.premises.bedspaces.new({ premisesId: premises.id })}">Add a bedspace</a>`
  }

  const sortedBedspaces = premises.bedspaces.sort((a, b) => {
    const statusPriority = { online: 1, upcoming: 2, archived: 3 }
    const aPriority = statusPriority[a.status]
    const bPriority = statusPriority[b.status]

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    return a.reference.localeCompare(b.reference)
  })

  return sortedBedspaces
    .map(
      bedspace => `<div class="govuk-!-margin-bottom-3">${formatBedspace(premises.id, bedspace, placeContext)}</div>`,
    )
    .join('')
}

const formatDate = (dateString: string | undefined | null): string => {
  const isEmpty = dateString === undefined || dateString === null || dateString === ''
  return isEmpty ? '' : DateFormats.isoDateToUIDate(dateString)
}

const formatTurnaround = (numberOfDays: number | undefined): string => {
  return `${numberOfDays} working days`
}

const formatDetails = (premisesId: string, characteristics: Array<Cas3PremisesCharacteristic>): string => {
  if (!characteristics || characteristics.length === 0) {
    return `<p>None</p><p><a href="${paths.premises.edit({ premisesId })}">Add property details</a></p>`
  }

  return characteristics
    .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.description}</span>`)
    .join(' ')
}

const getPremisesStatusTagColour = (status: Cas3PremisesStatus): string => {
  switch (status) {
    case 'online':
      return 'govuk-tag--green'
    case 'archived':
      return 'govuk-tag--grey'
    default:
      /* istanbul ignore next */
      return ''
  }
}

const formatArchiveHistory = (archiveHistory: Array<Cas3PremisesArchiveAction>): string => {
  if (archiveHistory.length >= ARCHIVE_HISTORY_THRESHOLD) {
    const formattedHistory = archiveHistory
      .map((action, index, arr) => {
        const classes = [
          'govuk-details__text',
          ...(index !== 0 ? ['govuk-!-padding-top-0'] : []),
          ...(index !== arr.length - 1 ? ['govuk-!-padding-bottom-0'] : []),
        ].join(' ')
        const verb = action.status === 'online' ? 'Online' : 'Archive'
        return `<div class="${classes}">${verb} date ${formatDate(action.date)}</div>`
      })
      .join('')

    return `<details class="govuk-details">
                <summary class="govuk-details__summary">
                  <span class="govuk-details__summary-text">
                    Full history
                  </span>
                </summary>
                ${formattedHistory}
              </details>`
  }

  return archiveHistory
    .map(action => {
      const verb = action.status === 'online' ? 'Online' : 'Archive'
      return `<div>${verb} date ${formatDate(action.date)}</div>`
    })
    .join('')
}

const formatPremisesStatus = (premises: Cas3Premises): string => {
  const tagClass = getPremisesStatusTagColour(premises.status)
  let html = `<strong class="govuk-tag ${tagClass}">${convertToTitleCase(premises.status)}</strong>`

  if (premises.status === 'online' && premises.endDate) {
    html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled archive date ${formatDate(premises.endDate)}</span>`
  } else if (premises.status === 'archived' && new Date(premises.scheduleUnarchiveDate) > new Date()) {
    html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled online date ${formatDate(premises.scheduleUnarchiveDate)}</span>`
  }

  return html
}

const formatNotes = (notes: string): string => notes.replace(/\n/g, '<br />')
