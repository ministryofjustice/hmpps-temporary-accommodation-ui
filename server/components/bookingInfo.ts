import type { Booking } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'
import { DateFormats } from '../utils/dateUtils'
import { formatLines } from '../utils/viewUtils'
import { formatStatus } from '../utils/bookingUtils'

export default (booking: Booking): SummaryList['rows'] => {
  const { status, arrivalDate, departureDate } = booking

  const rows = [
    {
      key: textValue('Status'),
      value: htmlValue(formatStatus(status)),
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
  } else if (status === 'departed') {
    rows.push({
      key: textValue('Departure date'),
      value: textValue(DateFormats.isoDateToUIDate(departureDate)),
    })
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
  } else if (status === 'departed') {
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

  if (booking.extensions.length) {
    const collatedNotes = booking.extensions
      .map(extension => extension.notes)
      .filter(notes => notes?.length > 0)
      .join('\n\n')

    rows.push({
      key: textValue('Extension notes'),
      value: htmlValue(formatLines(collatedNotes)),
    })
  }

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}
