import { bookingFactory, personFactory, restrictedPersonFactory, turnaroundFactory } from '../testutils/factories'
import { statusTag } from '../utils/bookingUtils'
import {
  personSummaryListRows,
  placementSummaryListRows,
  statusSummaryListRows,
  turnaroundSummaryListRows,
} from './bookingListing'

jest.mock('../utils/bookingUtils')

describe('BookingListing', () => {
  describe('personSummaryListRows', () => {
    it('returns summary list rows for the person of a booking', () => {
      const booking = bookingFactory.build({
        person: personFactory.build({
          dateOfBirth: '1980-04-08',
        }),
      })

      const result = personSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Date of birth' },
          value: { text: '8 April 1980' },
        },
        {
          key: { text: 'CRN' },
          value: { text: booking.person.crn },
        },
      ])
    })

    it('returns summary list rows for the person of a booking when the person is a LAO', () => {
      const booking = bookingFactory.build({
        person: restrictedPersonFactory.build(),
      })

      const result = personSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'CRN' },
          value: { text: booking.person.crn },
        },
      ])
    })
  })

  describe('statusSummaryListRows', () => {
    it('returns a summary list row for the booking status', () => {
      const booking = bookingFactory.build()

      const statusHtml = '<strong>Some status</strong>'
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)

      const result = statusSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Status' },
          value: { html: statusHtml },
        },
      ])
    })
  })

  describe('placementSummaryListRows', () => {
    it('returns a summary list row for a provisional booking placement', () => {
      const booking = bookingFactory.provisional().build({
        arrivalDate: '2023-02-21',
        departureDate: '2023-05-07',
      })

      const result = placementSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Start date' },
          value: { text: '21 February 2023' },
        },
        {
          key: { text: 'End date' },
          value: { text: '7 May 2023' },
        },
      ])
    })

    it('returns a summary list row for an arrived booking placement', () => {
      const booking = bookingFactory.arrived().build({
        arrivalDate: '2023-02-21',
        departureDate: '2023-05-07',
      })

      const result = placementSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Arrival date' },
          value: { text: '21 February 2023' },
        },
        {
          key: { text: 'Expected departure date' },
          value: { text: '7 May 2023' },
        },
      ])
    })

    it('returns a summary list row for a departed booking placement', () => {
      const booking = bookingFactory.departed().build({
        arrivalDate: '2023-02-21',
        departureDate: '2023-05-07',
      })

      const result = placementSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Arrival date' },
          value: { text: '21 February 2023' },
        },
        {
          key: { text: 'Departure date' },
          value: { text: '7 May 2023' },
        },
      ])
    })
  })

  describe('turnaroundSummaryListRows', () => {
    it('returns empty summary list rows for a booking without a turnaround', () => {
      const booking = bookingFactory.build()
      delete booking.turnaround

      const result = turnaroundSummaryListRows(booking)

      expect(result).toEqual([])
    })

    it('returns empty summary list rows for a booking without a zero-day turnaround', () => {
      const booking = bookingFactory.build({
        turnaround: turnaroundFactory.build({
          workingDays: 0,
        }),
      })

      const result = turnaroundSummaryListRows(booking)

      expect(result).toEqual([])
    })

    it('returns empty summary list rows for a cancelled booking', () => {
      const booking = bookingFactory.cancelled().build()

      const result = turnaroundSummaryListRows(booking)

      expect(result).toEqual([])
    })

    it('returns summary list rows for a booking with a non-trivial turnaround', () => {
      const booking = bookingFactory.arrived().build({
        turnaroundStartDate: '2024-11-04',
        effectiveEndDate: '2024-12-20',
      })

      const result = turnaroundSummaryListRows(booking)

      expect(result).toEqual([
        {
          key: { text: 'Start date' },
          value: { text: '4 November 2024' },
        },
        {
          key: { text: 'End date' },
          value: { text: '20 December 2024' },
        },
      ])
    })
  })
})
