import { faker } from '@faker-js/faker/.'
import bookingSearchResultsFactory from '../testutils/factories/bookingSearchResults'
import BookingClient from './bookingClient'
import { CallConfig } from './restClient'
import {
  arrivalFactory,
  bookingFactory,
  bookingSearchResultFactory,
  cancellationFactory,
  cas3NewBookingFactory,
  cas3NewDepartureFactory,
  cas3NewOverstayFactory,
  confirmationFactory,
  departureFactory,
  newArrivalFactory,
  newCancellationFactory,
  newConfirmationFactory,
  newTurnaroundFactory,
  turnaroundFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('BookingClient - ENABLE_CAS3V2_API flag off', provider => {
  let bookingClient: BookingClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    bookingClient = new BookingClient(callConfig)
  })

  describe('create', () => {
    it('should return the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const newBooking = cas3NewBookingFactory.build({
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
        crn: booking.person.crn,
      })

      const payload = {
        ...newBooking,
        bedId: newBooking.bedspaceId,
        bedspaceId: undefined as string,
      }

      await provider.addInteraction({
        state: 'Booking can be created',
        uponReceiving: 'a request to create a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/${booking.id}/bookings`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: booking,
        },
      })

      const result = await bookingClient.create(booking.id, newBooking)
      expect(result).toEqual(booking)
    })
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const premisesId = faker.string.uuid()
      const booking = bookingFactory.build()

      await provider.addInteraction({
        state: 'Booking exists',
        uponReceiving: 'a request for a booking',
        withRequest: {
          method: 'GET',
          path: `/premises/${premisesId}/bookings/${booking.id}`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: booking,
        },
      })

      const result = await bookingClient.find(premisesId, booking.id)
      expect(result).toEqual(booking)
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const premisesId = faker.string.uuid()
      const bookings = bookingFactory.buildList(5)

      await provider.addInteraction({
        state: 'Bookings exist for premises',
        uponReceiving: 'a request for all bookings for a premises',
        withRequest: {
          method: 'GET',
          path: `/premises/${premisesId}/bookings`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bookings,
        },
      })

      const result = await bookingClient.allBookingsForPremisesId(premisesId)
      expect(result).toEqual(bookings)
    })
  })

  describe('extendBooking', () => {
    it('should return the booking that has been extended', async () => {
      const premisesId = faker.string.uuid()
      const booking = bookingFactory.build()
      const payload = {
        newDepartureDate: '2042-12-11',
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }
      const body = {
        bookingId: booking.id,
        createdAt: booking.createdAt,
        id: booking.id,
        newDepartureDate: payload.newDepartureDate,
        notes: payload.notes,
        previousDepartureDate: booking.departureDate,
      }
      await provider.addInteraction({
        state: 'Booking can be extended',
        uponReceiving: 'a request to extend a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/${premisesId}/bookings/${booking.id}/extensions`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body,
        },
      })

      const result = await bookingClient.extendBooking(premisesId, booking.id, payload)
      expect(result).toEqual(body)
    })
  })

  describe('overstayBooking', () => {
    it('should return the mocked data', async () => {
      const premisesId = faker.string.uuid()
      const bookingId = faker.string.uuid()
      const overstay = cas3NewOverstayFactory.build()

      const expected = {
        bookingId,
        createdAt: expect.any(String),
        id: '6fced6ba-e775-479b-a5df-967e38672c2e',
        previousDepartureDate: expect.any(String),
        newDepartureDate: overstay.newDepartureDate,
        reason: overstay.reason,
        isAuthorised: overstay.isAuthorised,
      }

      const result = await bookingClient.overstayBooking(premisesId, bookingId, overstay)
      console.log(result)
      expect(result).toEqual(expected)
    })
  })

  describe('markAsConfirmed', () => {
    it('should create a confirmation', async () => {
      const premisesId = faker.string.uuid()
      const booking = bookingFactory.build()
      const confirmation = confirmationFactory.build()
      const payload = newConfirmationFactory.build({
        ...confirmation,
      })

      await provider.addInteraction({
        state: 'Booking can be confirmed',
        uponReceiving: 'a request to confirm a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/${premisesId}/bookings/${booking.id}/confirmations`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: confirmation,
        },
      })

      const result = await bookingClient.markAsConfirmed(premisesId, booking.id, payload)
      expect(result).toEqual(confirmation)
    })
  })

  describe('markAsArrived', () => {
    it('should create an arrival', async () => {
      const premisesId = faker.string.uuid()
      const booking = bookingFactory.build()
      const arrival = arrivalFactory.build()
      const payload = newArrivalFactory.build({
        arrivalDate: arrival.arrivalDate.toString(),
        expectedDepartureDate: arrival.expectedDepartureDate.toString(),
        notes: arrival.notes,
      })

      await provider.addInteraction({
        state: 'Booking can be marked as arrived',
        uponReceiving: 'a request to mark a booking as arrived',
        withRequest: {
          method: 'POST',
          path: `/cas3/premises/${premisesId}/bookings/${booking.id}/arrivals`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: arrival,
        },
      })

      const result = await bookingClient.markAsArrived(premisesId, booking.id, payload)

      expect(result).toEqual({
        ...arrival,
        arrivalDate: arrival.arrivalDate,
        expectedDepartureDate: arrival.expectedDepartureDate,
      })
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const premisesId = faker.string.uuid()
      const bookingId = faker.string.uuid()
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      await provider.addInteraction({
        state: 'Booking can be cancelled',
        uponReceiving: 'a request to cancel a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/${premisesId}/bookings/${bookingId}/cancellations`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newCancellation,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: cancellation,
        },
      })

      const result = await bookingClient.cancel(premisesId, bookingId, newCancellation)
      expect(result).toEqual(cancellation)
    })
  })

  describe('markDeparture', () => {
    it('should create a departure', async () => {
      const premisesId = faker.string.uuid()
      const bookingId = faker.string.uuid()
      const newDeparture = cas3NewDepartureFactory.build()
      const departure = departureFactory.build({ bookingId })
      delete departure.destinationProvider

      await provider.addInteraction({
        state: 'Booking can be marked as departed',
        uponReceiving: 'a request to mark a booking as departed',
        withRequest: {
          method: 'POST',
          path: `/cas3/premises/${premisesId}/bookings/${bookingId}/departures`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newDeparture,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: departure,
        },
      })

      const result = await bookingClient.markDeparture(premisesId, bookingId, newDeparture)
      expect(result).toEqual(departure)
    })
  })

  describe('createTurnaround', () => {
    it('should create a turnaround', async () => {
      const premisesId = faker.string.uuid()
      const bookingId = faker.string.uuid()
      const turnaround = turnaroundFactory.build()
      const payload = newTurnaroundFactory.build()

      await provider.addInteraction({
        state: 'Turnaround can be created',
        uponReceiving: 'a request to create a turnaround',
        withRequest: {
          method: 'POST',
          path: `/premises/${premisesId}/bookings/${bookingId}/turnarounds`,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: turnaround,
        },
      })

      const result = await bookingClient.createTurnaround(premisesId, bookingId, payload)
      expect(result).toEqual(turnaround)
    })
  })

  describe('search', () => {
    it('should return all provisional bookings with pagination headers', async () => {
      const bookings = bookingSearchResultsFactory.build()
      const body = { results: bookings.data }

      await provider.addInteraction({
        state: 'Provisional bookings exist',
        uponReceiving: 'a request for provisional bookings',
        withRequest: {
          method: 'GET',
          path: `${paths.bookings.search({})}`,
          query: {
            status: 'provisional',
            page: '1',
            sortField: 'endDate',
            sortOrder: 'descending',
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        },
      })

      const result = await bookingClient.search('provisional', { page: 1, sortBy: 'endDate', sortDirection: 'desc' })

      expect(result.data).toEqual(bookings.data)
    })

    it('should return confirmed bookings for a given CRN or Name', async () => {
      const booking = bookingSearchResultFactory.build({ person: { crn: 'C555333' } })
      const { data: bookings } = bookingSearchResultsFactory.build({ data: [booking] })
      const body = { results: bookings, resultsCount: bookings.length }

      await provider.addInteraction({
        state: 'Confirmed bookings exist for CRN',
        uponReceiving: 'a request for confirmed bookings by CRN',
        withRequest: {
          method: 'GET',
          path: `${paths.bookings.search({})}`,
          query: {
            status: 'confirmed',
            crnOrName: booking.person.crn,
            page: '1',
            sortField: 'endDate',
            sortOrder: 'descending',
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body,
        },
      })

      const result = await bookingClient.search('confirmed', { crnOrName: 'C555333', page: 1, sortDirection: 'desc' })

      expect(result.data).toEqual(bookings)
    })
  })
})
