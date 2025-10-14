import { Cas3Premises, Cas3PremisesBedspaceTotals } from '@approved-premises/api'
import { PageHeadingBarItem, PlaceContext } from '@approved-premises/ui'
import paths from '../../paths/temporary-accommodation/manage'
import config from '../../config'
import { addPlaceContext } from '../placeUtils'

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
