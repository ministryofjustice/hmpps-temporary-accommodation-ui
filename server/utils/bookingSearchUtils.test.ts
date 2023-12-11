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
            'aria-sort': 'ascending',
          },
        },
        {
          text: 'End date',
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

  it('returns table headings with end date sorted ascending for arrived and departed booking status', () => {
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
        text: 'Address',
      },
      {
        text: 'Start date',
        attributes: {
          'aria-sort': 'none',
        },
      },
      {
        text: 'End date',
        attributes: {
          'aria-sort': 'ascending',
        },
      },
      {
        html: '<span class="govuk-visually-hidden">Actions</span>',
      },
    ]

    expect(createTableHeadings('arrived')).toEqual(tableHeadings)
    expect(createTableHeadings('departed')).toEqual(tableHeadings)
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
