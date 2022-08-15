import type { Booking, IdentityBarMenu } from 'approved-premises'

export default function bookingActions(booking: Booking, premisesId: string): Array<IdentityBarMenu> {
  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = []

    if (booking.status === 'awaiting-arrival') {
      items.push({
        text: 'Mark as arrived',
        classes: 'govuk-button--secondary',
        href: `/premises/${premisesId}/bookings/${booking.id}/arrivals/new`,
      })
      items.push({
        text: 'Mark as not arrived',
        classes: 'govuk-button--secondary',
        href: `/premises/${premisesId}/bookings/${booking.id}/non-arrivals/new`,
      })
      items.push({
        text: 'Cancel booking',
        classes: 'govuk-button--secondary',
        href: `/premises/${premisesId}/bookings/${booking.id}/cancellation/new`,
      })
    }

    if (booking.status === 'arrived') {
      items.push({
        text: 'Log departure',
        classes: 'govuk-button--secondary',
        href: `/premises/${premisesId}/bookings/${booking.id}/departures/new`,
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
