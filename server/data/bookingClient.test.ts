import nock from 'nock'

import BookingClient from './bookingClient'
import bookingFactory from '../testutils/factories/booking'
import bookingDtoFactory from '../testutils/factories/bookingDto'
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
      const booking = bookingFactory.build()
      const payload = bookingDtoFactory.build({
        expectedArrivalDate: booking.expectedArrivalDate,
        expectedDepartureDate: booking.expectedDepartureDate,
        crn: booking.crn,
        keyWorkerId: booking.keyWorker.id,
        name: booking.name,
      })

      fakeApprovedPremisesApi
        .post(`/premises/some-uuid/bookings`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, booking)

      const result = await bookingClient.postBooking('some-uuid', payload)

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('getBooking', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      fakeApprovedPremisesApi
        .get(`/premises/premisesId/bookings/bookingId`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, booking)

      const result = await bookingClient.getBooking('premisesId', 'bookingId')

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const bookings = bookingFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(`/premises/some-uuid/bookings`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, bookings)

      const result = await bookingClient.allBookingsForPremisesId('some-uuid')

      expect(result).toEqual(bookings)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('extendBooking', () => {
    it('should return the booking that has been extended', async () => {
      const booking = bookingFactory.build()
      const payload = {
        newDepartureDate: new Date(2042, 13, 11).toISOString(),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/${booking.id}/extensions`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, booking)

      const result = await bookingClient.extendBooking('premisesId', booking.id, payload)

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
