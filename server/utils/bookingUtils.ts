import type { IdentityBarMenu } from '@approved-premises/ui'
import type { Booking } from '@approved-premises/api'
import paths from '../paths/manage'

export function bookingActions(booking: Booking, premisesId: string): Array<IdentityBarMenu> {
  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = []

    if (booking.status === 'awaiting-arrival') {
      items.push({
        text: 'Mark as arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.arrivals.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Mark as not arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.nonArrivals.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Extend placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
      })
    }

    if (booking.status === 'arrived') {
      items.push({
        text: 'Log departure',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Extend placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
      })
    }

    return [
      {
        items,
      },
    ]
  }

  return null
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
