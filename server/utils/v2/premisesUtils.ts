import { Cas3Premises, Cas3PremisesBedspaceTotals } from '@approved-premises/api'
import { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../../paths/temporary-accommodation/manage'

export const premisesActions = (premises: Cas3Premises): Array<PageHeadingBarItem> => {
  const actions = [
    {
      text: 'Edit property details',
      classes: 'govuk-button--secondary',
      href: paths.premises.v2.edit({ premisesId: premises.id }),
    },
  ]

  if (premises.status === 'online') {
    actions.push({
      text: 'Add a bedspace',
      classes: 'govuk-button--secondary',
      href: paths.premises.v2.bedspaces.new({ premisesId: premises.id }),
    })

    actions.push({
      text: 'Archive property',
      classes: 'govuk-button--secondary',
      href: paths.premises.v2.archive({ premisesId: premises.id }),
    })
  } else if (premises.status === 'archived') {
    actions.push({
      text: 'Make property online',
      classes: 'govuk-button--secondary',
      href: paths.premises.v2.unarchive({ premisesId: premises.id }),
    })
  }

  return actions.sort((a, b) => a.text.localeCompare(b.text))
}

export function isPremiseScheduledToBeArchived(totals: Cas3PremisesBedspaceTotals): boolean {
  if (!totals.premisesEndDate) return false
  const endDate = new Date(totals.premisesEndDate)
  const now = new Date()
  return endDate > now && totals.status !== 'archived'
}
