import { bookingActions, formatStatus, getLatestExtension } from './bookingUtils'
import bookingFactory from '../testutils/factories/booking'
import paths from '../paths/temporary-accommodation/manage'
import extensionFactory from '../testutils/factories/extension'

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
})
