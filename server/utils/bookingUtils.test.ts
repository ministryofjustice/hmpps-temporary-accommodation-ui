import { bookingActions, deriveBookingHistory, formatStatus, getLatestExtension } from './bookingUtils'
import bookingFactory from '../testutils/factories/booking'
import paths from '../paths/temporary-accommodation/manage'
import departureFactory from '../testutils/factories/departure'
import extensionFactory from '../testutils/factories/extension'
import arrivalFactory from '../testutils/factories/arrival'

const premisesId = 'premisesId'
const roomId = 'roomId'

describe('bookingUtils', () => {
  describe('bookingActions', () => {
    it('returns a mark as confirmed action for a provisional booking', () => {
      const booking = bookingFactory.provisional().build()

      expect(bookingActions(premisesId, roomId, booking)).toEqual([
        {
          items: [
            {
              text: 'Mark as confirmed',
              classes: '',
              href: paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }),
            },
            {
              text: 'Cancel booking',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId, roomId, bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it('returns a mark as active action for a confirmed booking', () => {
      const booking = bookingFactory.confirmed().build()

      expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
        {
          items: [
            {
              text: 'Mark as active',
              classes: '',
              href: paths.bookings.arrivals.new({ premisesId, roomId, bookingId: booking.id }),
            },
            {
              text: 'Cancel booking',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId, roomId, bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it('returns mark as closed and extend actions for an arrived booking', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
        {
          items: [
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
          ],
        },
      ])
    })

    it('returns null for adeparted booking', () => {
      const booking = bookingFactory.departed().build()

      expect(bookingActions('premisesId', 'roomId', booking)).toEqual(null)
    })

    it('returns null for a cancelled booking', () => {
      const booking = bookingFactory.cancelled().build()

      expect(bookingActions('premisesId', 'roomId', booking)).toEqual(null)
    })
  })

  describe('formatStatus', () => {
    it('returns the HTML formatted display name of a given status', () => {
      expect(formatStatus('confirmed')).toEqual('<strong class="govuk-tag govuk-tag--purple">Confirmed</strong>')
    })
  })

  describe('getLatestExtension', () => {
    it('returns undefined when the booking has no extensions', () => {
      const booking = bookingFactory.arrived().build({
        extensions: [],
      })

      expect(getLatestExtension(booking)).toEqual(undefined)
    })

    it('returns the most recent extension when the booking has extensions', () => {
      const extension1 = extensionFactory.build({
        createdAt: '2022-01-03',
      })
      const extension2 = extensionFactory.build({
        createdAt: '2022-09-23',
      })
      const extension3 = extensionFactory.build({
        createdAt: '2023-04-11',
      })

      const booking = bookingFactory.arrived().build({
        extensions: [extension2, extension3, extension1],
      })

      expect(getLatestExtension(booking)).toEqual(extension3)
    })
  })

  describe('deriveBookingHistory', () => {
    it('derives the booking history of a departed and extended booking', () => {
      const extensions = [
        extensionFactory.build({
          newDepartureDate: '2022-03-03',
          createdAt: '2022-04-01',
        }),

        extensionFactory.build({
          newDepartureDate: '2022-03-04',
          createdAt: '2022-04-02',
        }),

        extensionFactory.build({
          newDepartureDate: '2022-03-05',
          createdAt: '2022-04-03',
        }),
      ]

      const booking = bookingFactory.departed().build({
        originalArrivalDate: '2022-01-01',
        originalDepartureDate: '2022-03-01',
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-06',
        departure: departureFactory.build({
          dateTime: '2022-03-06',
        }),
        extensions: [extensions[2], extensions[0], extensions[1]],
        arrival: arrivalFactory.build({
          arrivalDate: '2022-01-02',
          expectedDepartureDate: '2022-03-02',
        }),
      })

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
            extensions: [],
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
            extensions: [],
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-02',
          },
          updatedAt: booking.arrival.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-03',
          },
          updatedAt: extensions[0].createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0], extensions[1]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-04',
          },
          updatedAt: extensions[1].createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0], extensions[1], extensions[2]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-05',
          },
          updatedAt: extensions[2].createdAt,
        },
        {
          booking: {
            ...booking,
            extensions: [extensions[0], extensions[1], extensions[2]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-06',
          },
          updatedAt: booking.departure.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a departed booking without extensions', () => {
      const booking = bookingFactory.departed().build({
        originalArrivalDate: '2022-01-01',
        originalDepartureDate: '2022-03-01',
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-03',
        departure: departureFactory.build({
          dateTime: '2022-03-03',
        }),
        extensions: [],
        arrival: arrivalFactory.build({
          arrivalDate: '2022-01-02',
          expectedDepartureDate: '2022-03-02',
        }),
      })

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-02',
          },
          updatedAt: booking.arrival.createdAt,
        },
        {
          booking: {
            ...booking,
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-03',
          },
          updatedAt: booking.departure.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a cancelled confirmed booking', () => {
      const booking = bookingFactory.cancelled().build()

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking,
          updatedAt: booking.cancellation.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a cancelled provisional booking', () => {
      const booking = bookingFactory.cancelled().build({
        confirmation: null,
      })

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking,
          updatedAt: booking.cancellation.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })
  })
})
