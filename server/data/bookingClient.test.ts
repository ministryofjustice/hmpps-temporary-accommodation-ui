import nock from 'nock'

import BookingClient from './bookingClient'

import arrivalFactory from '../testutils/factories/arrival'
import newBookingFactory from '../testutils/factories/newBooking'
import bookingFactory from '../testutils/factories/booking'
import cancellationFactory from '../testutils/factories/cancellation'
import newCancellationFactory from '../testutils/factories/newCancellation'
import departureFactory from '../testutils/factories/departure'
import newDepartureFactory from '../testutils/factories/newDeparture'
import nonArrivalFactory from '../testutils/factories/nonArrival'
import newArrivalFactory from '../testutils/factories/newArrival'

import config from '../config'
import confirmationFactory from '../testutils/factories/confirmation'
import newConfirmationFactory from '../testutils/factories/newConfirmation'

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

  describe('create', () => {
    it('should return the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const payload = newBookingFactory.build({
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
        crn: booking.person.crn,
      })

      fakeApprovedPremisesApi
        .post(`/premises/some-uuid/bookings`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, booking)

      const result = await bookingClient.create('some-uuid', payload)

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      fakeApprovedPremisesApi
        .get(`/premises/premisesId/bookings/bookingId`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, booking)

      const result = await bookingClient.find('premisesId', 'bookingId')

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

  describe('markAsConfirmed', () => {
    it('should create a confirmation', async () => {
      const confirmation = confirmationFactory.build()
      const payload = newConfirmationFactory.build({
        ...confirmation,
      })

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/confirmations`, payload)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, confirmation)

      const result = await bookingClient.markAsConfirmed('premisesId', 'bookingId', payload)

      expect(result).toEqual(confirmation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markAsArrived', () => {
    it('should create an arrival', async () => {
      const arrival = arrivalFactory.build()
      const payload = newArrivalFactory.build({
        arrivalDate: arrival.arrivalDate.toString(),
        expectedDepartureDate: arrival.expectedDepartureDate.toString(),
        notes: arrival.notes,
      })

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/arrivals`, payload)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, arrival)

      const result = await bookingClient.markAsArrived('premisesId', 'bookingId', payload)

      expect(result).toEqual({
        ...arrival,
        arrivalDate: arrival.arrivalDate,
        expectedDepartureDate: arrival.expectedDepartureDate,
      })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/cancellations`, newCancellation)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, cancellation)

      const result = await bookingClient.cancel('premisesId', 'bookingId', newCancellation)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('findCancellation', () => {
    it('given a cancellation ID should return a cancellation', async () => {
      const cancellation = cancellationFactory.build()

      fakeApprovedPremisesApi
        .get(`/premises/premisesId/bookings/bookingId/cancellations/${cancellation.id}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, cancellation)

      const result = await bookingClient.findCancellation('premisesId', 'bookingId', cancellation.id)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markDeparture', () => {
    it('should create a departure', async () => {
      const departure = newDepartureFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/departures`, departure)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, departure)

      const result = await bookingClient.markDeparture('premisesId', 'bookingId', departure)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('findDeparture', () => {
    it('given a departure ID should return a departure', async () => {
      const departure = departureFactory.build()

      fakeApprovedPremisesApi
        .get(`/premises/premisesId/bookings/bookingId/departures/${departure.id}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, departure)

      const result = await bookingClient.findDeparture('premisesId', 'bookingId', departure.id)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markNonArrival', () => {
    it('should create an non-arrival', async () => {
      const nonArrival = nonArrivalFactory.build()
      const payload = {
        date: nonArrival.date.toString(),
        notes: nonArrival.notes,
        reason: nonArrival.reason.id,
      }

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/non-arrivals`, payload)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, nonArrival)

      const result = await bookingClient.markNonArrival('premisesId', 'bookingId', payload)

      expect(result).toEqual(nonArrival)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
