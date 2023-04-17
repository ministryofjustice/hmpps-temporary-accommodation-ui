import type { BookingSearchApiStatus, BookingSearchUiStatus } from '@approved-premises/ui'
import { SideNavObj, TableCell } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'

export function createSideNavArr(status: BookingSearchUiStatus): Array<SideNavObj> {
  return [
    {
      text: 'Provisional',
      href: paths.bookings.search.provisional.index({}),
      active: status === 'provisional',
    },
    {
      text: 'Confirmed',
      href: paths.bookings.search.confirmed.index({}),
      active: status === 'confirmed',
    },
    {
      text: 'Active',
      href: paths.bookings.search.active.index({}),
      active: status === 'active',
    },
    {
      text: 'Departed',
      href: paths.bookings.search.departed.index({}),
      active: status === 'departed',
    },
  ]
}

export function createTableHeadings(status: BookingSearchUiStatus): Array<TableCell> {
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
        'aria-sort': ['provisional', 'confirmed'].includes(status) ? 'ascending' : 'none',
      },
    },
    {
      text: 'End date',
      attributes: {
        'aria-sort': ['active', 'departed'].includes(status) ? 'ascending' : 'none',
      },
    },
    {
      html: '<span class="govuk-visually-hidden">Actions</span>',
    },
  ]
}

export function convertApiStatusToUiStatus(status: BookingSearchApiStatus): BookingSearchUiStatus {
  switch (status) {
    case 'arrived':
      return 'active'
    default:
      return status
  }
}
