import type { IdentityBarMenu } from '@approved-premises/ui'
import type { Booking } from '@approved-premises/api'
import paths from '../paths/temporary-accommodation/manage'

export function bookingActions(premisesId: string, roomId: string, booking: Booking): Array<IdentityBarMenu> {
  const items = []

  if (booking.status === 'provisional') {
    items.push({
      text: 'Mark as confirmed',
      classes: '',
      href: paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }),
    })
  } else if (booking.status === 'confirmed') {
    items.push({
      text: 'Mark as active',
      classes: '',
      href: paths.bookings.arrivals.new({ premisesId, roomId, bookingId: booking.id }),
    })
  } else if (booking.status === 'arrived') {
    items.push({
      text: 'Mark as closed',
      classes: '',
      href: paths.bookings.departures.new({ premisesId, roomId, bookingId: booking.id }),
    })
  }

  return [{ items }]
}

export const allStatuses: Array<{ name: string; id: Booking['status']; tagClass: string }> = [
  {
    name: 'Provisional',
    id: 'provisional',
    tagClass: 'govuk-tag--blue',
  },
  {
    name: 'Confirmed',
    id: 'confirmed',
    tagClass: 'govuk-tag--purple',
  },
  {
    name: 'Active',
    id: 'arrived',
    tagClass: 'govuk-tag--green',
  },
  {
    name: 'Closed',
    id: 'departed',
    tagClass: 'govuk-tag--red',
  },
]

export function formatStatus(statusId: Booking['status']) {
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}
