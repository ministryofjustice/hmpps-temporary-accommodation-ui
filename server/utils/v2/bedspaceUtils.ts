import { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../../paths/temporary-accommodation/manage'

export function bedspaceActions(premises: Cas3Premises, bedspace: Cas3Bedspace): Array<PageHeadingBarItem> {
  return [
    {
      text: 'Edit bedspace details',
      href: paths.premises.v2.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
      classes: 'govuk-button--secondary',
    },
  ]
}
