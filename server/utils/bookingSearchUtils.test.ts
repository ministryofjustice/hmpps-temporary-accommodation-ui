import paths from '../paths/temporary-accommodation/manage'
import { createSideNavArr } from './bookingSearchUtils'

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
})
