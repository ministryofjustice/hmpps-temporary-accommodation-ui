import type { Booking } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'
import { statusTag } from '../utils/bookingUtils'
import { DateFormats } from '../utils/dateUtils'

export const personSummaryListRows = (booking: Booking): SummaryList['rows'] => {
  const rows = [
    {
      key: textValue('CRN'),
      value: textValue(booking.person.crn),
    },
  ] as SummaryList['rows']

  if (booking.person.dateOfBirth) {
    rows.unshift({
      key: textValue('Date of birth'),
      value: textValue(DateFormats.isoDateToUIDate(booking.person.dateOfBirth)),
    })
  }

  return rows
}

export const statusSummaryListRows = (booking: Booking): SummaryList['rows'] => {
  const rows = [
    {
      key: textValue('Status'),
      value: htmlValue(statusTag(booking.status)),
    },
  ] as SummaryList['rows']

  return rows
}

export const placementSummaryListRows = (booking: Booking): SummaryList['rows'] => {
  const rows = [] as SummaryList['rows']

  const { status, arrivalDate, departureDate } = booking

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
    rows.push(
      {
        key: textValue('Arrival date'),
        value: textValue(DateFormats.isoDateToUIDate(arrivalDate)),
      },
      {
        key: textValue('Departure date'),
        value: textValue(DateFormats.isoDateToUIDate(departureDate)),
      },
    )
  }

  return rows
}

export const turnaroundSummaryListRows = (booking: Booking): SummaryList['rows'] => {
  if (booking.status === 'cancelled' || !booking.turnaround || booking.turnaround.workingDays === 0) {
    return []
  }

  const rows = [
    {
      key: textValue('Start date'),
      value: textValue(DateFormats.isoDateToUIDate(booking.turnaroundStartDate)),
    },
    {
      key: textValue('End date'),
      value: textValue(DateFormats.isoDateToUIDate(booking.effectiveEndDate)),
    },
  ] as SummaryList['rows']

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}
