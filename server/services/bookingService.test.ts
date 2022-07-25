import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import BookingFactory from '../testutils/factories/booking'

jest.mock('../data/bookingClient.ts')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  let service: BookingService

  const bookingClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
    service = new BookingService(bookingClientFactory)
  })

  describe('postBooking', () => {
    it('on success returns the booking that has been posted', async () => {
      const booking = BookingFactory.build()
      bookingClient.postBooking.mockResolvedValue(booking)

      const postedBooking = await service.postBooking('premisesId', booking)
      expect(postedBooking).toEqual(booking)
    })
  })
})
