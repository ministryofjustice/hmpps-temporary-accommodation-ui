import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { SideNavObj, TableCell } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'

export function createSideNavArr(status: BookingSearchApiStatus): Array<SideNavObj> {
  const uiStatus = convertApiStatusToUiStatus(status)
  return [
    {
      text: 'Provisional',
      href: paths.bookings.search.provisional.index({}),
      active: uiStatus === 'provisional',
    },
    {
      text: 'Confirmed',
      href: paths.bookings.search.confirmed.index({}),
      active: uiStatus === 'confirmed',
    },
    {
      text: 'Active',
      href: paths.bookings.search.active.index({}),
      active: uiStatus === 'active',
    },
    {
      text: 'Departed',
      href: paths.bookings.search.departed.index({}),
      active: uiStatus === 'departed',
    },
  ]
}

export function createTableHeadings(status: BookingSearchApiStatus): Array<TableCell> {
  const uiStatus = convertApiStatusToUiStatus(status)
  return [
    {
      text: 'Name',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      text: 'CRN',
    },
    {
      text: 'Address',
    },
    {
      text: 'Start date',
      attributes: {
        'aria-sort': ['provisional', 'confirmed'].includes(uiStatus) ? 'ascending' : 'none',
      },
    },
    {
      text: 'End date',
      attributes: {
        'aria-sort': ['active', 'departed'].includes(uiStatus) ? 'ascending' : 'none',
      },
    },
    {
      html: '<span class="govuk-visually-hidden">Actions</span>',
    },
  ]
}

export function convertApiStatusToUiStatus(status: BookingSearchApiStatus): string {
  switch (status) {
    case 'arrived':
      return 'active'
    default:
      return status
  }
}

export function capitaliseStatus(status: BookingSearchApiStatus) {
  const uiStatus = convertApiStatusToUiStatus(status)
  return uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)
}
