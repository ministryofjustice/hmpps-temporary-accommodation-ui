import type { IdentityBarMenu } from '@approved-premises/ui'
import type { Booking } from '@approved-premises/api'
import paths from '../paths/manage'

export default function bookingActions(booking: Booking, premisesId: string): Array<IdentityBarMenu> {
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
        href: paths.bookings.arrivals.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Extend booking',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel booking',
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
        text: 'Extend booking',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel booking',
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
