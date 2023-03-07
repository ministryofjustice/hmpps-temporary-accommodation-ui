import type { PropertyStatus } from '@approved-premises/api'

type StatusInfo = { name: string; id: PropertyStatus; colour: string; isActive: boolean }

export const allStatuses: Array<StatusInfo> = [
  {
    name: 'Pending',
    id: 'pending',
    colour: 'yellow',
    isActive: false,
  },
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
