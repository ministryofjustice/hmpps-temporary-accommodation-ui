import nock from 'nock'

import bookingSearchResultsFactory from '../testutils/factories/bookingSearchResults'
import BookingClient from './bookingClient'
import RestClient, { CallConfig } from './restClient'

import {
  arrivalFactory,
  bookingFactory,
  bookingSearchResultFactory,
  cancellationFactory,
  cas3ArrivalFactory,
  cas3BookingFactory,
  cas3BookingSearchResultsFactory,
  cas3CancellationFactory,
  cas3ConfirmationFactory,
  cas3DepartureFactory,
  cas3ExtensionFactory,
  cas3NewBookingFactory,
  cas3NewDepartureFactory,
  cas3TurnaroundFactory,
  confirmationFactory,
  departureFactory,
  newArrivalFactory,
  newBookingFactory,
  newCancellationFactory,
  newConfirmationFactory,
  newExtensionFactory,
  newTurnaroundFactory,
  turnaroundFactory,
} from '../testutils/factories'

import config from '../config'
import paths from '../paths/api'
import cas3BookingSearchResultFactory from '../testutils/factories/cas3BookingSearchResult'

describe('BookingClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bookingClient: BookingClient

  const callConfig = { token: 'some-token' } as CallConfig

  const flagsConfigOriginal = config.flags

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.enableCas3v2Api = true
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    bookingClient = new BookingClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()

    config.flags = flagsConfigOriginal
  })

  describe('create', () => {
    it('should return the booking that has been posted', async () => {
      const booking = cas3BookingFactory.build()
      const payload = cas3NewBookingFactory.build({
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
        crn: booking.person.crn,
      })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bookings.create({ premisesId: 'some-uuid' }), payload)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, booking)

      const result = await bookingClient.create('some-uuid', payload)

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const booking = cas3BookingFactory.build()

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.bookings.show({ premisesId: 'premisesId', bookingId: 'bookingId' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, booking)

      const result = await bookingClient.find('premisesId', 'bookingId')

      expect(result).toEqual(booking)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const bookings = cas3BookingFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.bookings.index({ premisesId: 'some-uuid' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bookings)

      const result = await bookingClient.allBookingsForPremisesId('some-uuid')

      expect(result).toEqual(bookings)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('extendBooking', () => {
    it('should return the booking that has been extended', async () => {
      const booking = cas3BookingFactory.build()
      const payload = newExtensionFactory.build()
      const extension = cas3ExtensionFactory.build({
        bookingId: booking.id,
        ...payload,
      })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bookings.extensions({ premisesId: 'premisesId', bookingId: booking.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, extension)

      const result = await bookingClient.extendBooking('premisesId', booking.id, payload)

      expect(result).toEqual(extension)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markAsConfirmed', () => {
    it('should create a confirmation', async () => {
      const booking = cas3BookingFactory.build()
      const payload = newConfirmationFactory.build()
      const confirmation = cas3ConfirmationFactory.build({
        ...payload,
        bookingId: booking.id,
      })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bookings.confirmations({ premisesId: 'premisesId', bookingId: booking.id }), payload)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, confirmation)

      const result = await bookingClient.markAsConfirmed('premisesId', booking.id, payload)

      expect(result).toEqual(confirmation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markAsArrived', () => {
    it('should create an arrival', async () => {
      const booking = cas3BookingFactory.build()
      const payload = newArrivalFactory.build()
      const arrival = cas3ArrivalFactory.build({
        ...payload,
        bookingId: booking.id,
      })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bookings.arrivals({ premisesId: 'premisesId', bookingId: 'bookingId' }), payload)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, arrival)

      const result = await bookingClient.markAsArrived('premisesId', 'bookingId', payload)

      expect(result).toEqual(arrival)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const booking = cas3BookingFactory.build()
      const newCancellation = newCancellationFactory.build()
      const cancellation = cas3CancellationFactory.build()

      fakeApprovedPremisesApi
        .post(
          paths.cas3.premises.bookings.cancellations.create({ premisesId: 'premisesId', bookingId: booking.id }),
          newCancellation,
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, cancellation)

      const result = await bookingClient.cancel('premisesId', booking.id, newCancellation)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('findCancellation', () => {
    it('given a cancellation ID should return a cancellation', async () => {
      const cancellation = cas3CancellationFactory.build()

      fakeApprovedPremisesApi
        .get(
          paths.cas3.premises.bookings.cancellations.show({
            premisesId: 'premisesId',
            bookingId: 'bookingId',
            cancellationId: cancellation.id,
          }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, cancellation)

      const result = await bookingClient.findCancellation('premisesId', 'bookingId', cancellation.id)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markDeparture', () => {
    it('should create a departure', async () => {
      const departure = cas3NewDepartureFactory.build()

      fakeApprovedPremisesApi
        .post(
          paths.cas3.premises.bookings.departures.create({ premisesId: 'premisesId', bookingId: 'bookingId' }),
          departure,
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, departure)

      const result = await bookingClient.markDeparture('premisesId', 'bookingId', departure)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('findDeparture', () => {
    it('given a departure ID should return a departure', async () => {
      const departure = cas3DepartureFactory.build()

      fakeApprovedPremisesApi
        .get(
          paths.cas3.premises.bookings.departures.show({
            premisesId: 'premisesId',
            bookingId: 'bookingId',
            departureId: departure.id,
          }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, departure)

      const result = await bookingClient.findDeparture('premisesId', 'bookingId', departure.id)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('createTurnaround', () => {
    it('should create a turnaround', async () => {
      const turnaround = cas3TurnaroundFactory.build()
      const payload = newTurnaroundFactory.build()

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bookings.turnarounds({ premisesId: 'premisesId', bookingId: 'bookingId' }), payload)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, turnaround)

      const result = await bookingClient.createTurnaround('premisesId', 'bookingId', payload)

      expect(result).toEqual(turnaround)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('search', () => {
    it('should return all provisional bookings with pagination headers', async () => {
      const bookings = cas3BookingSearchResultsFactory.build()
      const body = { results: bookings.data }

      fakeApprovedPremisesApi
        .defaultReplyHeaders({
          'x-pagination-currentpage': String(bookings.pageNumber),
          'x-pagination-pagesize': String(bookings.pageSize),
          'x-pagination-totalpages': String(bookings.totalPages),
          'x-pagination-totalresults': String(bookings.data.length),
        })
        .get(`${paths.cas3.bookings.search({})}?status=provisional&page=1&sortField=endDate&sortOrder=descending`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, body)

      const result = await bookingClient.search('provisional', { page: 1, sortBy: 'endDate', sortDirection: 'desc' })

      expect(result.data).toEqual(bookings.data)
      expect(result.pageNumber).toEqual(bookings.pageNumber)
      expect(result.pageSize).toEqual(bookings.pageSize)
      expect(result.totalPages).toEqual(bookings.totalPages)
      expect(result.totalResults).toEqual(bookings.data.length)

      expect(nock.isDone()).toBeTruthy()
    })

    it('should return confirmed bookings for a given CRN or Name', async () => {
      const booking = cas3BookingSearchResultFactory.build({ person: { crn: 'C555333' } })
      const { data: bookings } = cas3BookingSearchResultsFactory.build({ data: [booking] })
      const body = { results: bookings, resultsCount: bookings.length }

      fakeApprovedPremisesApi
        .get(
          `${paths.cas3.bookings.search({})}?status=confirmed&crnOrName=${
            booking.person.crn
          }&page=1&sortField=endDate&sortOrder=descending`,
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, body)

      const result = await bookingClient.search('confirmed', { crnOrName: 'C555333', page: 1, sortDirection: 'desc' })

      expect(result.data).toEqual(bookings)
      expect(nock.isDone()).toBeTruthy()
    })

    it('calls restClient with the correct path when handed in provisional status, and defaults to sorting by end date descending', async () => {
      bookingClient.restClient = {
        get: jest.fn().mockResolvedValueOnce({
          body: {},
          header: {},
        }),
      } as unknown as jest.Mocked<RestClient>

      await bookingClient.search('provisional', {})

      expect(bookingClient.restClient.get).toHaveBeenCalledWith(
        {
          path: `${paths.cas3.bookings.search({})}?status=provisional&page=1&sortField=endDate&sortOrder=descending`,
        },
        true,
      )
      expect(nock.isDone()).toBeTruthy()
    })

    it('calls restClient with the correct path when handed in arrived status on page 2, sort by start date ascending', async () => {
      bookingClient.restClient = {
        get: jest.fn().mockResolvedValueOnce({
          body: {},
          header: {},
        }),
      } as unknown as jest.Mocked<RestClient>

      await bookingClient.search('arrived', { page: 2, sortBy: 'startDate', sortDirection: 'asc' })

      expect(bookingClient.restClient.get).toHaveBeenCalledWith(
        {
          path: `${paths.cas3.bookings.search({})}?status=arrived&page=2&sortField=startDate&sortOrder=ascending`,
        },
        true,
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('with the ENABLE_CAS3V2_API flag off', () => {
    beforeEach(() => {
      config.flags.enableCas3v2Api = false
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
          .post(paths.premises.bookings.create({ premisesId: 'some-uuid' }), payload)
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .get(paths.premises.bookings.show({ premisesId: 'premisesId', bookingId: 'bookingId' }))
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .get(paths.premises.bookings.index({ premisesId: 'some-uuid' }))
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .post(paths.premises.bookings.extensions({ premisesId: 'premisesId', bookingId: booking.id }))
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .post(paths.premises.bookings.confirmations({ premisesId: 'premisesId', bookingId: 'bookingId' }), payload)
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .post(paths.cas3.premises.bookings.arrivals({ premisesId: 'premisesId', bookingId: 'bookingId' }), payload)
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .post(
            paths.premises.bookings.cancellations.create({ premisesId: 'premisesId', bookingId: 'bookingId' }),
            newCancellation,
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .get(
            paths.premises.bookings.cancellations.show({
              premisesId: 'premisesId',
              bookingId: 'bookingId',
              cancellationId: cancellation.id,
            }),
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, cancellation)

        const result = await bookingClient.findCancellation('premisesId', 'bookingId', cancellation.id)

        expect(result).toEqual(cancellation)
        expect(nock.isDone()).toBeTruthy()
      })
    })

    describe('markDeparture', () => {
      it('should create a departure', async () => {
        const departure = cas3NewDepartureFactory.build()

        fakeApprovedPremisesApi
          .post(
            paths.cas3.premises.bookings.departures.create({ premisesId: 'premisesId', bookingId: 'bookingId' }),
            departure,
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
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
          .get(
            paths.premises.bookings.departures.show({
              premisesId: 'premisesId',
              bookingId: 'bookingId',
              departureId: departure.id,
            }),
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, departure)

        const result = await bookingClient.findDeparture('premisesId', 'bookingId', departure.id)

        expect(result).toEqual(departure)
        expect(nock.isDone()).toBeTruthy()
      })
    })

    describe('createTurnaround', () => {
      it('should create a turnaround', async () => {
        const turnaround = turnaroundFactory.build()
        const payload = newTurnaroundFactory.build()

        fakeApprovedPremisesApi
          .post(
            paths.premises.bookings.turnarounds.create({ premisesId: 'premisesId', bookingId: 'bookingId' }),
            payload,
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(201, turnaround)

        const result = await bookingClient.createTurnaround('premisesId', 'bookingId', payload)

        expect(result).toEqual(turnaround)
        expect(nock.isDone()).toBeTruthy()
      })
    })

    describe('search', () => {
      it('should return all provisional bookings with pagination headers', async () => {
        const bookings = bookingSearchResultsFactory.build()
        const body = { results: bookings.data }

        fakeApprovedPremisesApi
          .defaultReplyHeaders({
            'x-pagination-currentpage': String(bookings.pageNumber),
            'x-pagination-pagesize': String(bookings.pageSize),
            'x-pagination-totalpages': String(bookings.totalPages),
            'x-pagination-totalresults': String(bookings.data.length),
          })
          .get(`${paths.bookings.search({})}?status=provisional&page=1&sortField=endDate&sortOrder=descending`)
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, body)

        const result = await bookingClient.search('provisional', { page: 1, sortBy: 'endDate', sortDirection: 'desc' })

        expect(result.data).toEqual(bookings.data)
        expect(result.pageNumber).toEqual(bookings.pageNumber)
        expect(result.pageSize).toEqual(bookings.pageSize)
        expect(result.totalPages).toEqual(bookings.totalPages)
        expect(result.totalResults).toEqual(bookings.data.length)

        expect(nock.isDone()).toBeTruthy()
      })

      it('should return confirmed bookings for a given CRN or Name', async () => {
        const booking = bookingSearchResultFactory.build({ person: { crn: 'C555333' } })
        const { data: bookings } = bookingSearchResultsFactory.build({ data: [booking] })
        const body = { results: bookings, resultsCount: bookings.length }

        fakeApprovedPremisesApi
          .get(
            `${paths.bookings.search({})}?status=confirmed&crnOrName=${
              booking.person.crn
            }&page=1&sortField=endDate&sortOrder=descending`,
          )
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, body)

        const result = await bookingClient.search('confirmed', { crnOrName: 'C555333', page: 1, sortDirection: 'desc' })

        expect(result.data).toEqual(bookings)
        expect(nock.isDone()).toBeTruthy()
      })

      it('calls restClient with the correct path when handed in provisional status, and defaults to sorting by end date descending', async () => {
        bookingClient.restClient = {
          get: jest.fn().mockResolvedValueOnce({
            body: {},
            header: {},
          }),
        } as unknown as jest.Mocked<RestClient>

        await bookingClient.search('provisional', {})

        expect(bookingClient.restClient.get).toHaveBeenCalledWith(
          {
            path: '/bookings/search?status=provisional&page=1&sortField=endDate&sortOrder=descending',
          },
          true,
        )
        expect(nock.isDone()).toBeTruthy()
      })

      it('calls restClient with the correct path when handed in arrived status on page 2, sort by start date ascending', async () => {
        bookingClient.restClient = {
          get: jest.fn().mockResolvedValueOnce({
            body: {},
            header: {},
          }),
        } as unknown as jest.Mocked<RestClient>

        await bookingClient.search('arrived', { page: 2, sortBy: 'startDate', sortDirection: 'asc' })

        expect(bookingClient.restClient.get).toHaveBeenCalledWith(
          {
            path: '/bookings/search?status=arrived&page=2&sortField=startDate&sortOrder=ascending',
          },
          true,
        )
        expect(nock.isDone()).toBeTruthy()
      })
    })
  })
})
