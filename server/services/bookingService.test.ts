import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import bookingDtoFactory from '../testutils/factories/bookingDto'
import bookingFactory from '../testutils/factories/booking'
import { formatDate } from '../utils/utils'

jest.mock('../data/bookingClient.ts')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()
  const service = new BookingService(bookingClientFactory)
  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('postBooking', () => {
    it('on success returns the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const bookingDto = bookingDtoFactory.build()
      bookingClient.postBooking.mockResolvedValue(booking)

      const postedBooking = await service.postBooking(token, 'premisesId', bookingDto)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.postBooking).toHaveBeenCalledWith('premisesId', bookingDto)
    })
  })

  describe('getBooking', () => {
    it('on success returns the booking that has been requested', async () => {
      const expectedArrivalDate = new Date(2022, 2, 11)
      const expectedDepartureDate = new Date(2022, 2, 12)

      const booking = bookingFactory.build({
        expectedArrivalDate: expectedArrivalDate.toISOString(),
        expectedDepartureDate: expectedDepartureDate.toISOString(),
      })

      bookingClient.getBooking.mockResolvedValue(booking)

      const retrievedBooking = await service.getBooking(token, 'premisesId', booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.getBooking).toHaveBeenCalledWith('premisesId', booking.id)
    })
  })

  describe('bookingsToTableRows', () => {
    it('should convert bookings to table rows with an arrival date', () => {
      const premisesId = 'some-uuid'

      const booking1Date = new Date(2022, 10, 22)
      const booking2Date = new Date(2022, 2, 11)

      const bookings = [
        bookingFactory.build({ expectedArrivalDate: booking1Date.toISOString() }),
        bookingFactory.build({ expectedArrivalDate: booking2Date.toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'arrival')

      expect(results[0][0]).toEqual({ text: bookings[0].crn })
      expect(results[0][1]).toEqual({ text: formatDate(booking1Date) })
      expect(results[0][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[0].id}`),
      })

      expect(results[1][0]).toEqual({ text: bookings[1].crn })
      expect(results[1][1]).toEqual({ text: formatDate(booking2Date) })
      expect(results[1][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[1].id}`),
      })
    })

    it('should convert bookings to table rows with a departure date', () => {
      const premisesId = 'some-uuid'

      const booking1Date = new Date(2022, 10, 22)
      const booking2Date = new Date(2022, 2, 11)

      const bookings = [
        bookingFactory.build({ expectedDepartureDate: booking1Date.toISOString() }),
        bookingFactory.build({ expectedDepartureDate: booking2Date.toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'departure')

      expect(results[0][0]).toEqual({ text: bookings[0].crn })
      expect(results[0][1]).toEqual({ text: formatDate(booking1Date) })
      expect(results[0][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[0].id}`),
      })

      expect(results[1][0]).toEqual({ text: bookings[1].crn })
      expect(results[1][1]).toEqual({ text: formatDate(booking2Date) })
      expect(results[1][2]).toEqual({
        html: expect.stringMatching(`/premises/${premisesId}/bookings/${bookings[1].id}`),
      })
    })
  })

  describe('listOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
      const premisesId = 'some-uuid'
      const bookings = bookingFactory.buildList(3)

      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.listOfBookingsForPremisesId(token, premisesId)

      expect(results).toEqual(service.bookingsToTableRows(bookings, premisesId, 'arrival'))

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
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

      const results = await service.groupedListOfBookingsForPremisesId(token, 'some-uuid')

      expect(results.arrivingToday).toEqual(service.bookingsToTableRows(bookingsArrivingToday, premisesId, 'arrival'))
      expect(results.departingToday).toEqual(
        service.bookingsToTableRows(bookingsDepartingToday, premisesId, 'departure'),
      )
      expect(results.upcomingArrivals).toEqual(service.bookingsToTableRows(bookingsArrivingSoon, premisesId, 'arrival'))
      expect(results.upcomingDepartures).toEqual(
        service.bookingsToTableRows(bookingsDepartingSoon, premisesId, 'departure'),
      )

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })
  describe('currentResidents', () => {
    it('should return table rows of the current residents', async () => {
      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(2)
      const currentResidents = bookingFactory.arrived().buildList(2)

      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue([...currentResidents, ...bookingsArrivingToday])

      const results = await service.currentResidents(token, 'some-uuid')

      expect(results).toEqual(service.currentResidentsToTableRows(currentResidents, premisesId))

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })
})
