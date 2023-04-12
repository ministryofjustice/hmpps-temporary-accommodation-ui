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
          text: 'Closed',
          href: paths.bookings.search.closed.index({}),
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
          text: 'Name',
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          text: 'CRN',
        },
        {
          text: 'Location',
        },
        {
          text: 'Start',
          attributes: {
            'aria-sort': 'ascending',
          },
        },
        {
          text: 'End',
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          html: '<span class="govuk-visually-hidden">Actions</span>',
        },
      ]

      expect(createTableHeadings('provisional')).toEqual(tableHeadings)
      expect(createTableHeadings('confirmed')).toEqual(tableHeadings)
    })
  })

  it('returns table headings with end date sorted ascending for active and closed booking status', () => {
    const tableHeadings = [
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
        text: 'Location',
      },
      {
        text: 'Start',
        attributes: {
          'aria-sort': 'none',
        },
      },
      {
        text: 'End',
        attributes: {
          'aria-sort': 'ascending',
        },
      },
      {
        html: '<span class="govuk-visually-hidden">Actions</span>',
      },
    ]

    expect(createTableHeadings('active')).toEqual(tableHeadings)
    expect(createTableHeadings('closed')).toEqual(tableHeadings)
  })
})

describe('convertApiStatusToUiStatus', () => {
  it('returns the correct ui status for a given api status', () => {
    expect(convertApiStatusToUiStatus('provisional')).toEqual('provisional')
    expect(convertApiStatusToUiStatus('confirmed')).toEqual('confirmed')
    expect(convertApiStatusToUiStatus('arrived')).toEqual('active')
    expect(convertApiStatusToUiStatus('departed')).toEqual('closed')
  })
})
