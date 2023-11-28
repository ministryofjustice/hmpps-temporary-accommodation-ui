import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { BookingSearchSortField } from '@approved-premises/api'
import { SideNavObj, TableCell } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'
import { sortHeader } from './sortHeader'

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

export function createTableHeadings(
  status: BookingSearchApiStatus,
  sort: BookingSearchSortField,
  ascending: boolean,
  href: string,
): Array<TableCell> {
  return [
    sortHeader('Name', 'name', sort, ascending, href),
    sortHeader('CRN', 'crn', sort, ascending, href),
    {
      text: 'Address',
    },
    sortHeader('Start date', 'startDate', sort, ascending, href),
    sortHeader('End date', 'endDate', sort, ascending, href),
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
