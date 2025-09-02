import type { Premises, PropertyStatus } from '@approved-premises/api'
import { PageHeadingBarItem, PlaceContext, PremisesShowTabs, type SubNavObj } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'

type StatusInfo = { name: string; id: PropertyStatus; colour: string; isActive: boolean }

export const premisesActions = (premises: Premises): Array<PageHeadingBarItem> => {
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

export const allStatuses: Array<StatusInfo> = [
  {
    name: 'Online',
    id: 'active',
    colour: 'turquoise',
    isActive: true,
  },
  {
    name: 'Archived',
    id: 'archived',
    colour: 'grey',
    isActive: true,
  },
]

export const getActiveStatuses = (statuses: Array<StatusInfo>) => {
  return statuses.filter(status => status.isActive)
}

export const statusTag = (status: PropertyStatus) => {
  const info = statusInfo(status)

  return `<strong class="govuk-tag govuk-tag--${info.colour}">${info.name}</strong>`
}

export const statusInfo = (status: PropertyStatus): StatusInfo => {
  return allStatuses.find(({ id }) => id === status)
}

export const shortAddress = (premises: Premises): string => {
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
