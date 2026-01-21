import { faker } from '@faker-js/faker'
import describeClient from '../testutils/describeClient'
import BookingClient from './bookingClient'
import { CallConfig } from './restClient'
import {
  cas3ArrivalFactory,
  cas3BookingFactory,
  cas3BookingSearchResultFactory,
  cas3BookingSearchResultsFactory,
  cas3CancellationFactory,
  cas3ConfirmationFactory,
  cas3DepartureFactory,
  cas3ExtensionFactory,
  cas3NewBookingFactory,
  cas3NewDepartureFactory,
  cas3NewOverstayFactory,
  cas3OverstayFactory,
  cas3TurnaroundFactory,
  newArrivalFactory,
  newCancellationFactory,
  newConfirmationFactory,
  newExtensionFactory,
  newTurnaroundFactory,
} from '../testutils/factories'
import paths from '../paths/api'

describeClient('BookingClient', provider => {
  let bookingClient: BookingClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    bookingClient = new BookingClient(callConfig)
  })

  describe('create', () => {
    it('should return the booking that has been posted', async () => {
      const premisesId = faker.string.uuid()
      const booking = cas3BookingFactory.build()
      const payload = cas3NewBookingFactory.build(booking)

      await provider.addInteraction({
        state: 'Booking can be created',
        uponReceiving: 'a request to create a booking',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.create({ premisesId }),
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

      const result = await bookingClient.create(premisesId, payload)
      expect(result).toEqual(booking)
    })
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const premisesId = faker.string.uuid()
      const booking = cas3BookingFactory.build()

      await provider.addInteraction({
        state: 'Booking exists',
        uponReceiving: 'a request for a booking',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.bookings.show({ premisesId, bookingId: booking.id }),
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
      const bookings = cas3BookingFactory.buildList(5)

      await provider.addInteraction({
        state: 'Bookings exist for premises',
        uponReceiving: 'a request for all bookings for a premises',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.bookings.index({ premisesId }),
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
      const booking = cas3BookingFactory.build()
      const payload = newExtensionFactory.build()
      const extension = cas3ExtensionFactory.build({
        ...payload,
        bookingId: booking.id,
      })

      await provider.addInteraction({
        state: 'Booking can be extended',
        uponReceiving: 'a request to extend a booking',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.extensions({ premisesId, bookingId: booking.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: extension,
        },
      })

      const result = await bookingClient.extendBooking(premisesId, booking.id, payload)
      expect(result).toEqual(extension)
    })
  })

  describe('overstayBooking', () => {
    it('should return the mocked data', async () => {
      const premisesId = faker.string.uuid()
      const booking = cas3BookingFactory.build()
      const newOverstay = cas3NewOverstayFactory.build()
      const overstay = cas3OverstayFactory.build({ ...newOverstay })

      await provider.addInteraction({
        state: 'Booking can be overstayed',
        uponReceiving: 'a request to overstay a booking',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.overstays({ premisesId, bookingId: booking.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newOverstay,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: overstay,
        },
      })

      const result = await bookingClient.overstayBooking(premisesId, booking.id, newOverstay)

      expect(result).toEqual(overstay)
    })
  })

  describe('markAsConfirmed', () => {
    it('should create a confirmation', async () => {
      const premisesId = faker.string.uuid()
      const booking = cas3BookingFactory.build()
      const payload = newConfirmationFactory.build()
      const confirmation = cas3ConfirmationFactory.build({
        ...payload,
        bookingId: booking.id,
      })

      await provider.addInteraction({
        state: 'Booking can be confirmed',
        uponReceiving: 'a request to confirm a booking',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.confirmations({ premisesId, bookingId: booking.id }),
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
      const booking = cas3BookingFactory.build()
      const arrival = cas3ArrivalFactory.build({
        bookingId: booking.id,
      })
      const payload = newArrivalFactory.build({
        arrivalDate: arrival.arrivalDate,
        expectedDepartureDate: arrival.expectedDepartureDate,
      })

      await provider.addInteraction({
        state: 'Booking can be marked as arrived',
        uponReceiving: 'a request to mark a booking as arrived',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.arrivals({ premisesId, bookingId: booking.id }),
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

      expect(result).toEqual(arrival)
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const premisesId = faker.string.uuid()
      const bookingId = faker.string.uuid()
      const newCancellation = newCancellationFactory.build()
      const cancellation = cas3CancellationFactory.build()

      await provider.addInteraction({
        state: 'Booking can be cancelled',
        uponReceiving: 'a request to cancel a booking',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.cancellations.create({ premisesId, bookingId }),
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
      const departure = cas3DepartureFactory.build({ bookingId })

      await provider.addInteraction({
        state: 'Booking can be marked as departed',
        uponReceiving: 'a request to mark a booking as departed',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.departures.create({ premisesId, bookingId }),
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
      const turnaround = cas3TurnaroundFactory.build()
      const payload = newTurnaroundFactory.build()

      await provider.addInteraction({
        state: 'Turnaround can be created',
        uponReceiving: 'a request to create a turnaround',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bookings.turnarounds({ premisesId, bookingId }),
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
      const bookings = cas3BookingSearchResultsFactory.build()
      const body = { results: bookings.data, resultsCount: bookings.data.length }

      await provider.addInteraction({
        state: 'Provisional bookings exist',
        uponReceiving: 'a request for provisional bookings',
        withRequest: {
          method: 'GET',
          path: paths.cas3.bookings.search({}),
          query: {
            status: 'provisional',
            page: '1',
            sortField: 'endDate',
            sortDirection: 'desc',
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
      const booking = cas3BookingSearchResultFactory.build({ person: { crn: 'C555333' } })
      const { data: bookings } = cas3BookingSearchResultsFactory.build({ data: [booking] })
      const body = { results: bookings, resultsCount: bookings.length }

      await provider.addInteraction({
        state: 'Confirmed bookings exist for CRN',
        uponReceiving: 'a request for confirmed bookings by CRN',
        withRequest: {
          method: 'GET',
          path: paths.cas3.bookings.search({}),
          query: {
            status: 'confirmed',
            crnOrName: booking.person.crn,
            page: '1',
            sortField: 'endDate',
            sortDirection: 'asc',
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

      const result = await bookingClient.search('confirmed', { crnOrName: 'C555333', page: 1, sortDirection: 'asc' })

      expect(result.data).toEqual(bookings)
    })
  })
})
