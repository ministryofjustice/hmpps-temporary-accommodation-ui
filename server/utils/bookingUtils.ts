import type { Booking, Extension } from '@approved-premises/api'
import type { PageHeadingBarItem } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from './dateUtils'

export function bookingActions(premisesId: string, roomId: string, booking: Booking): Array<PageHeadingBarItem> {
  const items = []

  const cancelAction = {
    text: 'Cancel booking',
    classes: 'govuk-button--secondary',
    href: paths.bookings.cancellations.new({ premisesId, roomId, bookingId: booking.id }),
  }

  switch (booking.status) {
    case 'provisional':
      items.push(
        {
          text: 'Mark as confirmed',
          classes: '',
          href: paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }),
        },
        cancelAction,
      )
      break
    case 'confirmed':
      items.push(
        {
          text: 'Mark as active',
          classes: '',
          href: paths.bookings.arrivals.new({ premisesId, roomId, bookingId: booking.id }),
        },
        cancelAction,
      )
      break
    case 'arrived':
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
      break
    default:
      break
  }

  if (items.length === 0) {
    return null
  }

  return items
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

export const statusTag = (statusId: Booking['status']) => {
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}

export const getLatestExtension = (booking: Booking) => {
  return booking.extensions.reduce((latestExtension, testExtension) => {
    const latestTime = DateFormats.isoToDateObj(latestExtension.createdAt).getTime()
    const testTime = DateFormats.isoToDateObj(testExtension.createdAt).getTime()

    return latestTime > testTime ? latestExtension : testExtension
  }, booking.extensions?.[0])
}

export const deriveBookingHistory = (booking: Booking) => {
  const extensions = [...booking.extensions].sort((a, b) => {
    const dateA = DateFormats.isoToDateObj(a.createdAt)
    const dateB = DateFormats.isoToDateObj(b.createdAt)

    return dateA.getTime() - dateB.getTime()
  })

  const bookingWithSortedExensions = {
    ...booking,
    extensions,
  }

  const history = []

  for (let previous = bookingWithSortedExensions; previous; previous = getPredecessorForBooking(previous)) {
    history.push({ booking: previous, updatedAt: getUpdatedAt(previous) })
  }
  history.reverse()

  return history
}

export const shortenedOrExtended = (extension: Extension): 'shortened' | 'extended' => {
  const previousDepartureDate = DateFormats.isoToDateObj(extension.previousDepartureDate)
  const newDepartureDate = DateFormats.isoToDateObj(extension.newDepartureDate)

  return previousDepartureDate.getTime() > newDepartureDate.getTime() ? 'shortened' : 'extended'
}

const getUpdatedAt = (booking: Booking): string => {
  if (booking.status === 'departed') {
    return booking.departure.createdAt
  }
  if (booking.status === 'arrived') {
    if (booking.extensions.length === 0) {
      return booking.arrival.createdAt
    }
    return booking.extensions[booking.extensions.length - 1].createdAt
  }
  if (booking.status === 'cancelled') {
    return booking.cancellation.createdAt
  }
  if (booking.status === 'confirmed') {
    return booking.confirmation.createdAt
  }
  return booking.createdAt
}

const getPredecessorForBooking = (booking: Booking): Booking => {
  switch (booking.status) {
    case 'departed':
      return getPredecessorForDepartedBooking(booking)
    case 'arrived':
      return getPredecessorForArrivedBooking(booking)
    case 'cancelled':
      return getPredecessorForCancelledBooking(booking)
    case 'confirmed':
      return getPredecessorForConfirmedBooking(booking)
    default:
      return undefined
  }
}

const getPredecessorForDepartedBooking = (booking: Booking): Booking => {
  if (booking.extensions.length === 0) {
    return {
      ...booking,
      status: 'arrived',
      arrivalDate: booking.arrival.arrivalDate,
      departureDate: booking.arrival.expectedDepartureDate,
    }
  }

  return {
    ...booking,
    status: 'arrived',
    arrivalDate: booking.arrival.arrivalDate,
    departureDate: booking.extensions[booking.extensions.length - 1].newDepartureDate,
  }
}

const getPredecessorForArrivedBooking = (booking: Booking): Booking => {
  if (booking.extensions.length === 0) {
    return {
      ...booking,
      status: 'confirmed',
      arrivalDate: booking.originalArrivalDate,
      departureDate: booking.originalDepartureDate,
    }
  }

  if (booking.extensions.length === 1) {
    return {
      ...booking,
      status: 'arrived',
      extensions: [],
      departureDate: booking.arrival.expectedDepartureDate,
    }
  }

  return {
    ...booking,
    status: 'arrived',
    extensions: booking.extensions.slice(0, -1),
    departureDate: booking.extensions[booking.extensions.length - 2].newDepartureDate,
  }
}

const getPredecessorForCancelledBooking = (booking: Booking): Booking => {
  return {
    ...booking,
    status: booking.confirmation ? 'confirmed' : 'provisional',
  }
}

const getPredecessorForConfirmedBooking = (booking: Booking): Booking => {
  return {
    ...booking,
    status: 'provisional',
  }
}
