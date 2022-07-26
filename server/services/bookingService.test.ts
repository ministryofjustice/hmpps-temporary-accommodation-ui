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

  describe('listOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
      const bookings = [
        BookingFactory.build({ arrivalDate: new Date(2022, 10, 22) }),
        BookingFactory.build({ arrivalDate: new Date(2022, 2, 11) }),
      ]
      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.listOfBookingsForPremisesId('some-uuid')

      expect(results.length).toEqual(2)

      expect(results[0][0]).toEqual({ text: bookings[0].CRN })
      expect(results[0][1]).toEqual({ text: '22/11/2022' })
      expect(results[0][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[0].id}/arrivals/new`),
      })

      expect(results[1][0]).toEqual({ text: bookings[1].CRN })
      expect(results[1][1]).toEqual({ text: '11/03/2022' })
      expect(results[1][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[1].id}/arrivals/new`),
      })

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })
})
