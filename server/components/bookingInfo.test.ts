import { bookingFactory, cancellationFactory, extensionFactory } from '../testutils/factories'
import { getLatestExtension, shortenedOrExtended, statusTag } from '../utils/bookingUtils'
import { formatLines } from '../utils/viewUtils'
import summaryListRows from './bookingInfo'

jest.mock('../utils/viewUtils')
jest.mock('../utils/bookingUtils')

describe('BookingInfo', () => {
  const statusHtml = '<strong>Some status</strong>'

  describe('summaryListRows', () => {
    it('returns summary list rows for a provisional booking', () => {
      const booking = bookingFactory.provisional().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Start date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'End date',
          },
          value: {
            text: '7 January 2023',
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('provisional')
    })

    it('returns summary list rows for a confirmed booking', () => {
      const booking = bookingFactory.confirmed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Start date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'End date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.confirmation.notes,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('confirmed')
      expect(formatLines).toHaveBeenCalledWith(booking.confirmation.notes)
    })

    it('returns summary list rows for a cancelled booking', () => {
      const booking = bookingFactory.cancelled().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        cancellation: cancellationFactory.build({
          date: '2022-05-14',
        }),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Start date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'End date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Cancellation date',
          },
          value: {
            text: '14 May 2022',
          },
        },
        {
          key: {
            text: 'Cancellation reason',
          },
          value: {
            text: booking.cancellation.reason.name,
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.cancellation.notes,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('cancelled')
      expect(formatLines).toHaveBeenCalledWith(booking.cancellation.notes)
    })

    it('returns summary list rows for an arrived booking', () => {
      const booking = bookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'Expected departure date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.arrival.notes,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
    })

    it('returns summary list rows for an arrived and extended booking', () => {
      const booking = bookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        extensions: extensionFactory.buildList(2),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )
      ;(shortenedOrExtended as jest.MockedFunction<typeof shortenedOrExtended>).mockReturnValue('extended')

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'Expected departure date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.arrival.notes,
          },
        },
        {
          key: {
            text: 'Notes on extended booking',
          },
          value: {
            html: `${booking.extensions[0].notes}`,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
      expect(formatLines).toHaveBeenCalledWith(booking.extensions[0].notes)
      expect(getLatestExtension).toHaveBeenCalledWith(booking)
      expect(shortenedOrExtended).toHaveBeenCalledWith(booking.extensions[0])
    })

    it('returns summary list rows for an arrived and shortended booking', () => {
      const booking = bookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        extensions: extensionFactory.buildList(2),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )
      ;(shortenedOrExtended as jest.MockedFunction<typeof shortenedOrExtended>).mockReturnValue('shortened')

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: '21 March 2022',
          },
        },
        {
          key: {
            text: 'Expected departure date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.arrival.notes,
          },
        },
        {
          key: {
            text: 'Notes on shortened booking',
          },
          value: {
            html: `${booking.extensions[0].notes}`,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
      expect(formatLines).toHaveBeenCalledWith(booking.extensions[0].notes)
      expect(getLatestExtension).toHaveBeenCalledWith(booking)
      expect(shortenedOrExtended).toHaveBeenCalledWith(booking.extensions[0])
    })

    it('returns summary list rows for a departed booking', () => {
      const booking = bookingFactory.departed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07T00:00:00.000Z',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: statusHtml,
          },
        },
        {
          key: {
            text: 'Departure date',
          },
          value: {
            text: '7 January 2023',
          },
        },
        {
          key: {
            text: 'Departure reason',
          },
          value: {
            text: booking.departure.reason.name,
          },
        },
        {
          key: {
            text: 'Move on category',
          },
          value: {
            text: booking.departure.moveOnCategory.name,
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: booking.departure.notes,
          },
        },
      ])

      expect(statusTag).toHaveBeenCalledWith('departed')
      expect(formatLines).toHaveBeenCalledWith(booking.departure.notes)
    })
  })
})
