import type { IdentityBarMenu } from '@approved-premises/ui'
import type { Booking } from '@approved-premises/api'
import paths from '../paths/temporary-accommodation/manage'

export function bookingActions(premisesId: string, roomId: string, booking: Booking): Array<IdentityBarMenu> {
  const items = []

  const cancelAction = {
    text: 'Cancel booking',
    classes: 'govuk-button--secondary',
    href: paths.bookings.cancellations.new({ premisesId, roomId, bookingId: booking.id }),
  }

  if (booking.status === 'provisional') {
    items.push(
      {
        text: 'Mark as confirmed',
        classes: '',
        href: paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }),
      },
      cancelAction,
    )
  } else if (booking.status === 'confirmed') {
    items.push(
      {
        text: 'Mark as active',
        classes: '',
        href: paths.bookings.arrivals.new({ premisesId, roomId, bookingId: booking.id }),
      },
      cancelAction,
    )
  } else if (booking.status === 'arrived') {
    items.push(
      {
        text: 'Mark as closed',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.new({ premisesId, roomId, bookingId: booking.id }),
      },
      {
        text: 'Extend or shorten booking',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, roomId, bookingId: booking.id }),
      },
    )
  }

  if (items.length === 0) {
    return null
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
  {
    name: 'Cancelled',
    id: 'cancelled',
    tagClass: 'govuk-tag--orange',
  },
]

export function formatStatus(statusId: Booking['status']) {
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}
