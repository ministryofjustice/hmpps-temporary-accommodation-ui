import type { Booking, Cancellation, Departure, Extension } from '@approved-premises/api'
import type { BespokeError, PageHeadingBarItem } from '@approved-premises/ui'
import config from '../config'
import paths from '../paths/temporary-accommodation/manage'
import { SanitisedError } from '../sanitisedError'
import { DateFormats } from './dateUtils'

type ParsedConflictError = {
  conflictingEntityId: string
  conflictingEntityType: 'booking' | 'lost-bed'
}

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
          text: 'Mark as departed',
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
    case 'departed':
      items.push({
        text: 'Update departed booking',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.edit({ premisesId, roomId, bookingId: booking.id }),
      })
      break
    case 'cancelled':
      items.push({
        text: 'Update cancelled booking',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.edit({ premisesId, roomId, bookingId: booking.id }),
      })
      break
    default:
      break
  }

  if (!config.flags.turnaroundsDisabled && booking.status !== 'cancelled') {
    items.push({
      text: 'Change turnaround time',
      classes: 'govuk-button--secondary',
      href: paths.bookings.turnarounds.edit({ premisesId, roomId, bookingId: booking.id }),
    })
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
    name: config.flags.turnaroundsDisabled ? 'Departed' : 'Departed - Turnaround In Progress',
    id: 'departed',
    tagClass: 'govuk-tag--red',
  },
  {
    name: 'Departed',
    id: 'closed',
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
  const extensions = [...booking.extensions].sort(compareBookingState)
  const departures = [...booking.departures].sort(compareBookingState)
  const cancellations = [...booking.cancellations].sort(compareBookingState)

  const bookingWithSortedExensions = {
    ...booking,
    extensions,
    departures,
    cancellations,
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

export const transformApiBookingToUiBooking = (booking: Booking): Booking => {
  if (booking.status === 'closed') {
    return { ...booking, status: 'departed' }
  }
  return booking
}

export const generateConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  roomId: string,
  datesGrammaticalNumber: 'plural' | 'singular',
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title =
    datesGrammaticalNumber === 'plural'
      ? 'This bedspace is not available for the dates entered'
      : 'This bedspace is not available for the date entered'

  const link =
    conflictingEntityType === 'lost-bed'
      ? `<a href="${paths.lostBeds.show({
          premisesId,
          roomId,
          lostBedId: conflictingEntityId,
        })}">existing void</a>`
      : `<a href="${paths.bookings.show({
          premisesId,
          roomId,
          bookingId: conflictingEntityId,
        })}">existing booking</a>`

  const message = datesGrammaticalNumber === 'plural' ? `They conflict with an ${link}` : `It conflicts with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

export const generateTurnaroundConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  roomId: string,
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title = 'The turnaround time could not be changed'

  const link =
    conflictingEntityType === 'lost-bed'
      ? `<a href="${paths.lostBeds.show({
          premisesId,
          roomId,
          lostBedId: conflictingEntityId,
        })}">existing void</a>`
      : `<a href="${paths.bookings.show({
          premisesId,
          roomId,
          bookingId: conflictingEntityId,
        })}">existing booking</a>`

  const message = `The new turnaround time would conflict with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

const parseConflictError = (detail: string): ParsedConflictError => {
  const detailWords = detail.split(' ')
  const conflictingEntityId = detailWords[detailWords.length - 1]
  const conflictingEntityType = detail.includes('Lost Bed') ? 'lost-bed' : 'booking'

  return { conflictingEntityId, conflictingEntityType }
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
  if (booking.departures.length > 1) {
    return {
      ...booking,
      departures: booking.departures.slice(0, -1),
      departure: booking.departures[booking.departures.length - 2],
      departureDate: booking.departures[booking.departures.length - 2].dateTime,
    }
  }

  if (booking.extensions.length > 0) {
    return {
      ...booking,
      status: 'arrived',
      arrivalDate: booking.arrival.arrivalDate,
      departureDate: booking.extensions[booking.extensions.length - 1].newDepartureDate,
    }
  }

  return {
    ...booking,
    status: 'arrived',
    arrivalDate: booking.arrival.arrivalDate,
    departureDate: booking.arrival.expectedDepartureDate,
  }
}

const getPredecessorForArrivedBooking = (booking: Booking): Booking => {
  if (booking.extensions.length > 1) {
    return {
      ...booking,
      extensions: booking.extensions.slice(0, -1),
      departureDate: booking.extensions[booking.extensions.length - 2].newDepartureDate,
    }
  }

  if (booking.extensions.length === 1) {
    return {
      ...booking,
      extensions: [],
      departureDate: booking.arrival.expectedDepartureDate,
    }
  }

  return {
    ...booking,
    status: 'confirmed',
    arrivalDate: booking.originalArrivalDate,
    departureDate: booking.originalDepartureDate,
  }
}

const getPredecessorForCancelledBooking = (booking: Booking): Booking => {
  if (booking.cancellations.length > 1) {
    return {
      ...booking,
      cancellations: booking.cancellations.slice(0, -1),
      cancellation: booking.cancellations[booking.cancellations.length - 2],
    }
  }

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

const compareBookingState = (a: Extension | Departure | Cancellation, b: Extension | Departure | Cancellation) => {
  const dateA = DateFormats.isoToDateObj(a.createdAt)
  const dateB = DateFormats.isoToDateObj(b.createdAt)

  return dateA.getTime() - dateB.getTime()
}
