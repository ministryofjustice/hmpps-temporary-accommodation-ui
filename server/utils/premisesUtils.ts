import type { PropertyStatus } from '@approved-premises/api'

export const allStatuses: Array<{ name: string; id: PropertyStatus; isActive: boolean }> = [
  {
    name: 'Pending',
    id: 'pending',
    isActive: false,
  },
  {
    name: 'Online',
    id: 'active',
    isActive: true,
  },
  {
    name: 'Archived',
    id: 'archived',
    isActive: true,
  },
]

export function getActiveStatuses(statuses: Array<{ name: string; id: PropertyStatus; isActive: boolean }>) {
  return statuses.filter(status => status.isActive)
}

export function formatStatus(status: PropertyStatus): string {
  return allStatuses.find(({ id }) => id === status).name
}
