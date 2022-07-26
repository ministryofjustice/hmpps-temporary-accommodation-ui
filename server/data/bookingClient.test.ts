import nock from 'nock'

import BookingClient from './bookingClient'
import BookingFactory from '../testutils/factories/booking'
import config from '../config'

describe('BookingClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bookingClient: BookingClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    bookingClient = new BookingClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('postBooking', () => {
    it('should return the booking that has been posted', async () => {
      const booking = BookingFactory.build()
      const payload = {
        arrivalDate: booking.arrivalDate.toString(),
        expectedDepartureDate: booking.expectedDepartureDate.toString(),
        CRN: booking.CRN,
        keyWorker: booking.keyWorker,
      }

      fakeApprovedPremisesApi
        .post(`/premises/${booking.id}/bookings`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, booking)

      const result = await bookingClient.postBooking(booking.id, payload)

      expect(result).toEqual({
        ...booking,
        arrivalDate: (booking.arrivalDate as Date).toISOString(),
        expectedDepartureDate: (booking.expectedDepartureDate as Date).toISOString(),
      })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const bookings = BookingFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(`/premises/some-uuid/bookings`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, bookings)

      const result = await bookingClient.allBookingsForPremisesId('some-uuid')
      const expectedBookings = bookings.map(booking => {
        return {
          ...booking,
          arrivalDate: (booking.arrivalDate as Date).toISOString(),
          expectedDepartureDate: (booking.expectedDepartureDate as Date).toISOString(),
        }
      })

      expect(result).toEqual(expectedBookings)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
