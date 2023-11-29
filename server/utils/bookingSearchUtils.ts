import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { BookingSearchSortField } from '@approved-premises/api'
import { SubNavObj, TableCell } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'
import { appendQueryString } from './utils'
import { sortHeader } from './sortHeader'

export function createSubNavArr(status: BookingSearchApiStatus, crn?: string): Array<SubNavObj> {
  const uiStatus = convertApiStatusToUiStatus(status)
  return ['provisional', 'confirmed', 'active', 'departed'].map((bookingStatus: BookingSearchApiStatus) => ({
    text: `${capitaliseStatus(bookingStatus)} bookings`,
    href: appendQueryString(paths.bookings.search[bookingStatus].index({}), { crn }),
    active: uiStatus === bookingStatus,
  }))
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

export function capitaliseStatus(status: BookingSearchApiStatus) {
  const uiStatus = convertApiStatusToUiStatus(status)
  return uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)
}
