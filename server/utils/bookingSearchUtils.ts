import type { BookingSearchApiStatus } from '@approved-premises/ui'
import {
  BookingSearchResult,
  BookingSearchSortField,
  Cas3BookingSearchResult,
  Cas3BookingStatus,
} from '@approved-premises/api'
import { SubNavObj, TableCell } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'
import { appendQueryString } from './utils'
import { sortHeader } from './sortHeader'

export function createSubNavArr(status: BookingSearchApiStatus, crnOrName?: string): Array<SubNavObj> {
  const uiStatus = convertApiStatusToUiStatus(status)
  return ['provisional', 'confirmed', 'active', 'departed'].map((bookingStatus: BookingSearchApiStatus) => ({
    text: `${capitaliseStatus(bookingStatus)} bookings`,
    href: appendQueryString(paths.bookings.search[bookingStatus].index({}), { crnOrName }),
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

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utilities and all usages
export const isCas3BookingSearchResults = (
  results: Array<BookingSearchResult> | Array<Cas3BookingSearchResult>,
): results is Array<Cas3BookingSearchResult> =>
  Boolean(results.length === 0 || (results[0] as Cas3BookingSearchResult).bedspace?.reference)

export const bookingSearchResultsToCas3BookingSearchResults = (
  results: Array<BookingSearchResult> | Array<Cas3BookingSearchResult>,
): Array<Cas3BookingSearchResult> =>
  isCas3BookingSearchResults(results)
    ? results
    : results.map(result => ({
        bedspace: {
          id: result.bed.id,
          reference: result.bed.name,
        },
        booking: {
          ...result.booking,
          status: result.booking.status as Cas3BookingStatus,
        },
        person: result.person,
        premises: result.premises,
      }))
