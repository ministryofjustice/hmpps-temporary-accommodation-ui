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

export function formatStatus(statusId: Booking['status']) {
  const status = allStatuses.find(({ id }) => id === statusId)
  return `<strong class="govuk-tag ${status.tagClass}">${status.name}</strong>`
}

export const getLatestExtension = (booking: Booking) => {
  return booking.extensions.reduce((latestExtension, testExtension) => {
    const latestTime = DateFormats.convertIsoToDateObj(latestExtension.createdAt).getTime()
    const testTime = DateFormats.convertIsoToDateObj(testExtension.createdAt).getTime()

    return latestTime > testTime ? latestExtension : testExtension
  }, booking.extensions?.[0])
}

export const deriveBookingHistory = (booking: Booking) => {
  const extensions = [...booking.extensions].sort((a, b) => {
    const dateA = DateFormats.convertIsoToDateObj(a.createdAt)
    const dateB = DateFormats.convertIsoToDateObj(b.createdAt)

    return dateA.getTime() - dateB.getTime()
  })

  const bookingWithSortedExensions = {
    ...booking,
    extensions,
  }

  const history = []

  for (let previous = bookingWithSortedExensions; previous; previous = getPreviousBookingState(previous)) {
    history.push({ booking: previous, updatedAt: getUpdatedAt(previous) })
  }
  history.reverse()

  return history
}

export const shortenedOrExtended = (extension: Extension): 'shortened' | 'extended' => {
  const previousDepartureDate = DateFormats.convertIsoToDateObj(extension.previousDepartureDate)
  const newDepartureDate = DateFormats.convertIsoToDateObj(extension.newDepartureDate)

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

const getPreviousBookingState = (booking: Booking): Booking => {
  switch (booking.status) {
    case 'departed':
      return getPreviousDepartedBookingState(booking)
    case 'arrived':
      return getPreviousArrivedBookingState(booking)
    case 'cancelled':
      return getPreviousCancelledBookingState(booking)
    case 'confirmed':
      return getPreviousConfirmedBookingState(booking)
    default:
      return undefined
  }
}

const getPreviousDepartedBookingState = (booking: Booking): Booking => {
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

const getPreviousArrivedBookingState = (booking: Booking): Booking => {
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

const getPreviousCancelledBookingState = (booking: Booking): Booking => {
  return {
    ...booking,
    status: booking.confirmation ? 'confirmed' : 'provisional',
  }
}

const getPreviousConfirmedBookingState = (booking: Booking): Booking => {
  return {
    ...booking,
    status: 'provisional',
  }
}
