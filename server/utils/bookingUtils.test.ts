import bookingActions from './bookingUtils'
import bookingFactory from '../testutils/factories/booking'
import paths from '../paths/manage'

describe('bookingUtils', () => {
  describe('bookingActions', () => {
    it('should return null when the booking is cancelled, departed or did not arrive', () => {
      const cancelledBooking = bookingFactory.cancelledWithFutureArrivalDate().build()
      const departedBooking = bookingFactory.departedToday().build()
      const nonArrivedBooking = bookingFactory.notArrived().build()

      expect(bookingActions(cancelledBooking, 'premisesId')).toEqual(null)
      expect(bookingActions(departedBooking, 'premisesId')).toEqual(null)
      expect(bookingActions(nonArrivedBooking, 'premisesId')).toEqual(null)
    })

    it('should return arrival, non-arrival and cancellation actions if a booking is awaiting arrival', () => {
      const booking = bookingFactory.arrivingToday().build()

      expect(bookingActions(booking, 'premisesId')).toEqual([
        {
          items: [
            {
              classes: 'govuk-button--secondary',
              href: paths.bookings.arrivals.new({ premisesId: 'premisesId', bookingId: booking.id }),
              text: 'Mark as arrived',
            },
            {
              classes: 'govuk-button--secondary',
              href: paths.bookings.arrivals.new({ premisesId: 'premisesId', bookingId: booking.id }),
              text: 'Mark as not arrived',
            },
            {
              text: 'Extend booking',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId: 'premisesId', bookingId: booking.id }),
              text: 'Cancel booking',
            },
          ],
        },
      ])
    })

    it('should return a departure action if a booking is arrived', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions(booking, 'premisesId')).toEqual([
        {
          items: [
            {
              classes: 'govuk-button--secondary',
              href: paths.bookings.departures.new({ premisesId: 'premisesId', bookingId: booking.id }),
              text: 'Log departure',
            },
            {
              text: 'Extend booking',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId: 'premisesId', bookingId: booking.id }),
              text: 'Cancel booking',
            },
          ],
        },
      ])
    })
  })
})
