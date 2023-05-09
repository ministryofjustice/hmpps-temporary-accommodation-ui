import type { Booking } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'
import config from '../config'
import { getLatestExtension, shortenedOrExtended, statusTag } from '../utils/bookingUtils'
import { DateFormats } from '../utils/dateUtils'
import { formatLines } from '../utils/viewUtils'

export default (booking: Booking): SummaryList['rows'] => {
  const { status, arrivalDate, departureDate } = booking

  const rows = [
    {
      key: textValue('Status'),
      value: htmlValue(statusTag(status)),
    },
  ] as SummaryList['rows']

  if (status === 'provisional' || status === 'confirmed' || status === 'cancelled') {
    rows.push({
      key: textValue('Start date'),
      value: textValue(DateFormats.isoDateToUIDate(arrivalDate)),
    })

    rows.push({
      key: textValue('End date'),
      value: textValue(DateFormats.isoDateToUIDate(departureDate)),
    })
  } else if (status === 'arrived') {
    rows.push(
      {
        key: textValue('Arrival date'),
        value: textValue(DateFormats.isoDateToUIDate(arrivalDate)),
      },
      {
        key: textValue('Expected departure date'),
        value: textValue(DateFormats.isoDateToUIDate(departureDate)),
      },
    )
  } else if (status === 'departed' || status === 'closed') {
    rows.push({
      key: textValue('Departure date'),
      value: textValue(DateFormats.isoDateToUIDate(departureDate)),
    })
  }

  if (!config.flags.turnaroundsDisabled) {
    const days = booking.turnaround.workingDays

    rows.push(
      {
        key: textValue('Turnaround time'),
        value: textValue(`${days} working ${days === 1 ? 'day' : 'days'}`),
      },
      {
        key: textValue('Turnaround end date'),
        value: textValue(DateFormats.isoDateToUIDate(booking.effectiveEndDate || booking.departureDate)),
      },
    )
  }

  if (status === 'confirmed') {
    rows.push({
      key: textValue('Notes'),
      value: htmlValue(formatLines(booking.confirmation.notes)),
    })
  } else if (status === 'cancelled') {
    rows.push(
      {
        key: textValue('Cancellation date'),
        value: textValue(DateFormats.isoDateToUIDate(booking.cancellation.date)),
      },
      {
        key: textValue('Cancellation reason'),
        value: textValue(booking.cancellation.reason.name),
      },
      {
        key: textValue('Notes'),
        value: htmlValue(formatLines(booking.cancellation.notes)),
      },
    )
  } else if (status === 'arrived') {
    rows.push({
      key: textValue('Notes'),
      value: htmlValue(formatLines(booking.arrival.notes)),
    })

    const latestExtension = getLatestExtension(booking)

    if (latestExtension) {
      const text =
        shortenedOrExtended(latestExtension) === 'shortened'
          ? 'Notes on shortened booking'
          : 'Notes on extended booking'

      rows.push({
        key: textValue(text),
        value: htmlValue(formatLines(latestExtension.notes)),
      })
    }
  } else if (status === 'departed' || status === 'closed') {
    rows.push(
      {
        key: textValue('Departure reason'),
        value: textValue(booking.departure.reason.name),
      },
      {
        key: textValue('Move on category'),
        value: textValue(booking.departure.moveOnCategory.name),
      },
      {
        key: textValue('Notes'),
        value: htmlValue(formatLines(booking.departure.notes)),
      },
    )
  }

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}
