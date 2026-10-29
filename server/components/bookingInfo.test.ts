import {
  cas3BookingFactory,
  cas3CancellationFactory,
  cas3ExtensionFactory,
  cas3OverstayFactory,
} from '../testutils/factories'
import { getLatestExtension, shortenedOrExtended, statusTag } from '../utils/bookingUtils'
import { formatLines } from '../utils/viewUtils'
import summaryListRows from './bookingInfo'
import config from '../config'

jest.mock('../utils/viewUtils')
jest.mock('../utils/bookingUtils')

describe('BookingInfo', () => {
  const statusHtml = '<strong>Some status</strong>'

  describe('summaryListRows', () => {
    beforeEach(() => {
      config.flags.bookingOverstayEnabled = false
    })
    it('returns summary list rows for a provisional booking', () => {
      const booking = cas3BookingFactory.provisional().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('provisional')
    })

    it('returns summary list rows for a confirmed booking', () => {
      const booking = cas3BookingFactory.confirmed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('confirmed')
      expect(formatLines).toHaveBeenCalledWith(booking.confirmation.notes)
    })

    it('returns summary list rows for a cancelled booking', () => {
      const booking = cas3BookingFactory.cancelled().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        cancellation: cas3CancellationFactory.build({
          date: '2022-05-14',
        }),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('cancelled')
      expect(formatLines).toHaveBeenCalledWith(booking.cancellation.notes)
    })

    it('returns summary list rows for an arrived booking', () => {
      const booking = cas3BookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
    })
    it('returns summary list rows for an overstay arrived booking', () => {
      config.flags.bookingOverstayEnabled = true
      const cas3Overstay = cas3OverstayFactory.build()
      const booking = cas3BookingFactory.arrived().build({
        overstays: [cas3Overstay],
      })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)
      expect(result).toEqual(
        expect.arrayContaining([
          {
            key: {
              text: 'Overstay',
            },
            value: {
              html: undefined,
            },
          },
        ]),
      )
    })
    it('returns summary list rows for an overstay departed booking', () => {
      config.flags.bookingOverstayEnabled = true
      const cas3Overstay = cas3OverstayFactory.build()
      const booking = cas3BookingFactory.departed().build({
        overstays: [cas3Overstay],
      })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)
      expect(result).toEqual(
        expect.arrayContaining([
          {
            key: {
              text: 'Overstay',
            },
            value: {
              html: undefined,
            },
          },
        ]),
      )
    })
    it('returns summary list rows for an overstay closed booking', () => {
      config.flags.bookingOverstayEnabled = true
      const cas3Overstay = cas3OverstayFactory.build()
      const booking = cas3BookingFactory.closed().build({
        overstays: [cas3Overstay],
      })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)
      expect(result).toEqual(
        expect.arrayContaining([
          {
            key: {
              text: 'Overstay',
            },
            value: {
              html: undefined,
            },
          },
        ]),
      )
    })

    it('returns summary list rows for an arrived and extended booking', () => {
      const booking = cas3BookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        extensions: cas3ExtensionFactory.buildList(2),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )
      ;(shortenedOrExtended as jest.MockedFunction<typeof shortenedOrExtended>).mockReturnValue('extended')

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
      expect(formatLines).toHaveBeenCalledWith(booking.extensions[0].notes)
      expect(getLatestExtension).toHaveBeenCalledWith(booking)
      expect(shortenedOrExtended).toHaveBeenCalledWith(booking.extensions[0])
    })

    it('returns summary list rows for an arrived and shortened booking', () => {
      const booking = cas3BookingFactory.arrived().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
        extensions: cas3ExtensionFactory.buildList(2),
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )
      ;(shortenedOrExtended as jest.MockedFunction<typeof shortenedOrExtended>).mockReturnValue('shortened')

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
      expect(formatLines).toHaveBeenCalledWith(booking.extensions[0].notes)
      expect(getLatestExtension).toHaveBeenCalledWith(booking)
      expect(shortenedOrExtended).toHaveBeenCalledWith(booking.extensions[0])
    })

    it('returns summary list rows for a departed booking', () => {
      const booking = cas3BookingFactory.departed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07T00:00:00.000Z',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('departed')
      expect(formatLines).toHaveBeenCalledWith(booking.departure.notes)
    })

    it('returns summary list rows for a closed booking', () => {
      const booking = cas3BookingFactory.closed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07T00:00:00.000Z',
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
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
        ]),
      )

      expect(statusTag).toHaveBeenCalledWith('closed')
      expect(formatLines).toHaveBeenCalledWith(booking.departure.notes)
    })

    it('returns summary list rows containing the turnaround time when it is more than one day', () => {
      const booking = cas3BookingFactory.build({
        effectiveEndDate: '2023-02-11',
        turnaround: {
          workingDays: 4,
        },
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
          {
            key: {
              text: 'Turnaround time',
            },
            value: {
              text: '4 working days',
            },
          },
          {
            key: {
              text: 'Turnaround end date',
            },
            value: {
              text: '11 February 2023',
            },
          },
        ]),
      )
    })

    it('returns summary list rows containing the turnaround time when it is exactly one day', () => {
      const booking = cas3BookingFactory.build({
        effectiveEndDate: '2023-02-11',
        turnaround: {
          workingDays: 1,
        },
      })

      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
          {
            key: {
              text: 'Turnaround time',
            },
            value: {
              text: '1 working day',
            },
          },
          {
            key: {
              text: 'Turnaround end date',
            },
            value: {
              text: '11 February 2023',
            },
          },
        ]),
      )
    })

    it('returns summary list rows containing the turnaround time when the turnaround is not present', () => {
      const booking = cas3BookingFactory.build({
        effectiveEndDate: '2023-02-11',
        turnaround: undefined,
      })

      const result = summaryListRows(booking)

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: {
              text: 'Turnaround time',
            },
            value: {
              text: '0 working days',
            },
          }),
        ]),
      )
    })
  })
})
