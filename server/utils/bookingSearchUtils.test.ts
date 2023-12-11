import paths from '../paths/temporary-accommodation/manage'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from './bookingSearchUtils'

describe('bookingSearchUtils', () => {
  describe('createSideNavArr', () => {
    it('returns side nav with given status selected', () => {
      const sideNavArr = [
        {
          text: 'Provisional',
          href: paths.bookings.search.provisional.index({}),
          active: true,
        },
        {
          text: 'Confirmed',
          href: paths.bookings.search.confirmed.index({}),
          active: false,
        },
        {
          text: 'Active',
          href: paths.bookings.search.active.index({}),
          active: false,
        },
        {
          text: 'Departed',
          href: paths.bookings.search.departed.index({}),
          active: false,
        },
      ]

      expect(createSideNavArr('provisional')).toEqual(sideNavArr)
    })
  })

  describe('createTableHeadings', () => {
    it('returns table headings with start date sorted ascending for provisional or confirmed booking status', () => {
      const tableHeadings = [
        {
          html: '<a href="?sortBy=name"><button>Name</button></a>',
          attributes: {
            'aria-sort': 'none',
            'data-cy-sort-field': 'name',
          },
        },
        {
          html: '<a href="?sortBy=crn"><button>CRN</button></a>',
          attributes: {
            'aria-sort': 'none',
            'data-cy-sort-field': 'crn',
          },
        },
        {
          text: 'Address',
        },
        {
          html: '<a href="?sortBy=startDate&sortDirection=desc"><button>Start date</button></a>',
          attributes: {
            'aria-sort': 'ascending',
            'data-cy-sort-field': 'startDate',
          },
        },
        {
          html: '<a href="?sortBy=endDate"><button>End date</button></a>',
          attributes: {
            'aria-sort': 'none',
            'data-cy-sort-field': 'endDate',
          },
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
        html: '<a href="?sortBy=name"><button>Name</button></a>',
        attributes: {
          'aria-sort': 'none',
          'data-cy-sort-field': 'name',
        },
      },
      {
        html: '<a href="?sortBy=crn"><button>CRN</button></a>',
        attributes: {
          'aria-sort': 'none',
          'data-cy-sort-field': 'crn',
        },
      },
      {
        text: 'Address',
      },
      {
        html: '<a href="?sortBy=startDate"><button>Start date</button></a>',
        attributes: {
          'aria-sort': 'none',
          'data-cy-sort-field': 'startDate',
        },
      },
      {
        html: '<a href="?sortBy=endDate&sortDirection=asc"><button>End date</button></a>',
        attributes: {
          'aria-sort': 'descending',
          'data-cy-sort-field': 'endDate',
        },
      },
      {
        html: '<span class="govuk-visually-hidden">Actions</span>',
      },
    ]

    expect(createTableHeadings('arrived', 'endDate', false, '')).toEqual(tableHeadings)
    expect(createTableHeadings('departed', 'endDate', false, '')).toEqual(tableHeadings)
  })
})

describe('convertApiStatusToUiStatus', () => {
  it('returns the correct ui status for a given api status', () => {
    expect(convertApiStatusToUiStatus('provisional')).toEqual('provisional')
    expect(convertApiStatusToUiStatus('confirmed')).toEqual('confirmed')
    expect(convertApiStatusToUiStatus('arrived')).toEqual('active')
    expect(convertApiStatusToUiStatus('departed')).toEqual('departed')
  })
})
