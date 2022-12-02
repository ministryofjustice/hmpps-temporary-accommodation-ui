import { bookingActions, formatStatus } from './bookingUtils'
import bookingFactory from '../testutils/factories/booking'
import paths from '../paths/temporary-accommodation/manage'

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
          ],
        },
      ])
    })

    it('returns an empty list of action items for an arrived booking', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
        {
          items: [],
        },
      ])
    })
  })

  describe('formatStatus', () => {
    it('returns the HTML formatted display name of a given status', () => {
      expect(formatStatus('confirmed')).toEqual('<strong class="govuk-tag govuk-tag--purple">Confirmed</strong>')
    })
  })
})
