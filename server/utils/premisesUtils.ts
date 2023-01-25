import type { DateCapacity, PropertyStatus } from '@approved-premises/api'

export type NegativeDateRange = { start?: string; end?: string }

export function getDateRangesWithNegativeBeds(premisesCapacity: DateCapacity[]): NegativeDateRange[] {
  let dateRange: NegativeDateRange = {}
  const result: NegativeDateRange[] = []

  premisesCapacity.forEach((premisesCapacityItem, i, arr) => {
    if (premisesCapacityItem.availableBeds < 0 && !dateRange?.start) {
      dateRange.start = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds < 0 && dateRange.start) {
      dateRange.end = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds >= 0 && dateRange.start) {
      result.push(dateRange)
      dateRange = {}
    }
    if (arr.length === i + 1 && dateRange.start) {
      result.push(dateRange)
    }
  })

  return result
}

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
