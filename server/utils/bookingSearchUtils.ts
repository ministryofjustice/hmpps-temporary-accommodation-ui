import { BookingSearchStatus } from '@approved-premises/api'
import { SideNavObj } from '../@types/ui/index'
import paths from '../paths/temporary-accommodation/manage'

export function createSideNavArr(status: BookingSearchStatus): Array<SideNavObj> {
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
      text: 'Closed',
      href: paths.bookings.search.closed.index({}),
      active: status === 'closed',
    },
  ]
}
