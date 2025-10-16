import type { Cas3Premises } from '@approved-premises/api'
import { PageHeadingBarItem, PlaceContext, PremisesShowTabs, type SubNavObj } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'

export const premisesActions = (premises: Cas3Premises): Array<PageHeadingBarItem> => {
  const items = []

  if (premises.status !== 'archived') {
    items.push({
      text: 'Add a bedspace',
      classes: 'govuk-button--secondary',
      href: paths.premises.bedspaces.new({ premisesId: premises.id }),
    })
  }

  if (items.length === 0) {
    return null
  }

  return items
}

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
