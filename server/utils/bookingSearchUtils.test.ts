import { BookingSearchApiStatus } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import {
  capitaliseStatus,
  convertApiStatusToUiStatus,
  createSubNavArr,
  createTableHeadings,
} from './bookingSearchUtils'

describe('bookingSearchUtils', () => {
  describe('createSideNavArr', () => {
    it('returns side nav with given status selected', () => {
      const sideNavArr = [
        {
          text: 'Provisional bookings',
          href: paths.bookings.search.provisional.index({}),
          active: true,
        },
        {
          text: 'Confirmed bookings',
          href: paths.bookings.search.confirmed.index({}),
          active: false,
        },
        {
          text: 'Active bookings',
          href: paths.bookings.search.active.index({}),
          active: false,
        },
        {
          text: 'Departed bookings',
          href: paths.bookings.search.departed.index({}),
          active: false,
        },
      ]

      expect(createSubNavArr('provisional')).toEqual(sideNavArr)
    })

    it('appends the CRN parameter if given', () => {
      const sideNavArr = [
        {
          text: 'Provisional bookings',
          href: `${paths.bookings.search.provisional.index({})}?crnOrName=X222555`,
          active: true,
        },
        {
          text: 'Confirmed bookings',
          href: `${paths.bookings.search.confirmed.index({})}?crnOrName=X222555`,
          active: false,
        },
        {
          text: 'Active bookings',
          href: `${paths.bookings.search.active.index({})}?crnOrName=X222555`,
          active: false,
        },
        {
          text: 'Departed bookings',
          href: `${paths.bookings.search.departed.index({})}?crnOrName=X222555`,
          active: false,
        },
      ]

      expect(createSubNavArr('provisional', 'X222555')).toEqual(sideNavArr)
    })
  })

  describe('createTableHeadings', () => {
    it('returns table headings with start date sorted ascending for provisional or confirmed booking status', () => {
      const tableHeadings = [
        {
          html: '<a href="?sortBy=name&sortDirection=asc"><button>Name</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<a href="?sortBy=crn&sortDirection=asc"><button>CRN</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          text: 'Address',
        },
        {
          html: '<a href="?sortBy=startDate&sortDirection=desc"><button>Start date</button></a>',
          attributes: { 'aria-sort': 'ascending' },
        },
        {
          html: '<a href="?sortBy=endDate&sortDirection=asc"><button>End date</button></a>',
          attributes: { 'aria-sort': 'none' },
        },
        {
          html: '<span class="govuk-visually-hidden">Actions</span>',
        },
      ]

      expect(createTableHeadings('provisional', 'startDate', true, '')).toEqual(tableHeadings)
      expect(createTableHeadings('confirmed', 'startDate', true, '')).toEqual(tableHeadings)
    })
  })

  it('returns table headings with end date sorted ascending for arrived and departed booking status', () => {
    const tableHeadings = [
      {
        html: '<a href="?sortBy=name&sortDirection=asc"><button>Name</button></a>',
        attributes: { 'aria-sort': 'none' },
      },
      {
        html: '<a href="?sortBy=crn&sortDirection=asc"><button>CRN</button></a>',
        attributes: { 'aria-sort': 'none' },
      },
      {
        text: 'Address',
      },
      {
        html: '<a href="?sortBy=startDate&sortDirection=asc"><button>Start date</button></a>',
        attributes: { 'aria-sort': 'none' },
      },
      {
        html: '<a href="?sortBy=endDate&sortDirection=asc"><button>End date</button></a>',
        attributes: { 'aria-sort': 'descending' },
      },
      {
        html: '<span class="govuk-visually-hidden">Actions</span>',
      },
    ]

    expect(createTableHeadings('arrived', 'endDate', false, '')).toEqual(tableHeadings)
    expect(createTableHeadings('departed', 'endDate', false, '')).toEqual(tableHeadings)
  })

  it.each(['provisional', 'confirmed', 'arrived', 'departed'])(
    'retains the CRN search parameter in the urls for sorting %s bookings',
    (status: BookingSearchApiStatus) => {
      const tableHeadings = createTableHeadings(status, undefined, undefined, '?crn=N777666')

      tableHeadings
        .filter(heading => !!heading.attributes)
        .forEach(heading => expect(heading.html).toContain('crn=N777666'))
    },
  )

  it.each(['provisional', 'confirmed', 'arrived', 'departed'])(
    'removes the existing page query parameter so the new view shows the first page of %s bookings',
    (status: BookingSearchApiStatus) => {
      const tableHeadings = createTableHeadings(status, undefined, undefined, '?page=13')

      tableHeadings
        .filter(heading => !!heading.attributes)
        .forEach(heading => expect(heading.html).not.toContain('page='))
    },
  )
})

describe('convertApiStatusToUiStatus', () => {
  it('returns the correct ui status for a given api status', () => {
    expect(convertApiStatusToUiStatus('provisional')).toEqual('provisional')
    expect(convertApiStatusToUiStatus('confirmed')).toEqual('confirmed')
    expect(convertApiStatusToUiStatus('arrived')).toEqual('active')
    expect(convertApiStatusToUiStatus('departed')).toEqual('departed')
  })
})

describe('capitaliseStatus', () => {
  it('returns the capitalised version of the given api status', () => {
    expect(capitaliseStatus('provisional')).toEqual('Provisional')
    expect(capitaliseStatus('confirmed')).toEqual('Confirmed')
    expect(capitaliseStatus('arrived')).toEqual('Active')
    expect(capitaliseStatus('departed')).toEqual('Departed')
  })
})
