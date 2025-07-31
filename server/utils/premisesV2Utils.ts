import { Cas3Premises } from '@approved-premises/api'
import { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'

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
  }

  return actions.sort((a, b) => a.text.localeCompare(b.text))
}
