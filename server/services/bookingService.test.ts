import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import bookingDtoFactory from '../testutils/factories/bookingDto'
import bookingFactory from '../testutils/factories/booking'

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
      const booking = bookingFactory.build()
      const bookingDto = bookingDtoFactory.build()
      bookingClient.postBooking.mockResolvedValue(booking)

      const postedBooking = await service.postBooking('premisesId', bookingDto)
      expect(postedBooking).toEqual(booking)
    })
  })

  describe('getBooking', () => {
    it('on success returns the booking that has been requested', async () => {
      const booking = bookingFactory.build({
        arrivalDate: new Date(2022, 2, 11).toISOString(),
        expectedDepartureDate: new Date(2022, 2, 12).toISOString(),
      })

      bookingClient.getBooking.mockResolvedValue(booking)

      const retrievedBooking = await service.getBooking('premisesId', booking.id)
      expect(retrievedBooking).toEqual({ ...booking, arrivalDate: '11/03/2022', expectedDepartureDate: '12/03/2022' })
    })
  })

  describe('bookingsToTableRows', () => {
    it('should convert bookings to table rows with an arrival date', () => {
      const premisesId = 'some-uuid'
      const bookings = [
        bookingFactory.build({ arrivalDate: new Date(2022, 10, 22).toISOString() }),
        bookingFactory.build({ arrivalDate: new Date(2022, 2, 11).toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'arrival')

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
    })

    it('should convert bookings to table rows with a departure date', () => {
      const premisesId = 'some-uuid'
      const bookings = [
        bookingFactory.build({ expectedDepartureDate: new Date(2022, 10, 22).toISOString() }),
        bookingFactory.build({ expectedDepartureDate: new Date(2022, 2, 11).toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'departure')

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
    })
  })

  describe('listOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
      const premisesId = 'some-uuid'
      const bookings = bookingFactory.buildList(3)

      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.listOfBookingsForPremisesId(premisesId)

      expect(results).toEqual(service.bookingsToTableRows(bookings, premisesId, 'arrival'))

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('groupedListOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(2)
      const arrivedBookings = bookingFactory.arrivedToday().buildList(2)

      const bookingsDepartingToday = bookingFactory.departingToday().buildList(3)
      const departedBookings = bookingFactory.departedToday().buildList(5)

      const bookingsArrivingSoon = bookingFactory.arrivingSoon().buildList(2)

      const cancelledBookingsWithFutureArrivalDate = bookingFactory.cancelledWithFutureArrivalDate().buildList(2)

      const bookingsDepartingSoon = bookingFactory.departingSoon().buildList(3)

      const bookings = [
        ...bookingsArrivingToday,
        ...arrivedBookings,
        ...bookingsDepartingToday,
        ...departedBookings,
        ...bookingsArrivingSoon,
        ...cancelledBookingsWithFutureArrivalDate,
        ...bookingsDepartingSoon,
      ]
      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.groupedListOfBookingsForPremisesId('some-uuid')

      expect(results.arrivingToday).toEqual(service.bookingsToTableRows(bookingsArrivingToday, premisesId, 'arrival'))
      expect(results.departingToday).toEqual(
        service.bookingsToTableRows(bookingsDepartingToday, premisesId, 'departure'),
      )
      expect(results.upcomingArrivals).toEqual(service.bookingsToTableRows(bookingsArrivingSoon, premisesId, 'arrival'))
      expect(results.upcomingDepartures).toEqual(
        service.bookingsToTableRows(bookingsDepartingSoon, premisesId, 'departure'),
      )

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })
})
