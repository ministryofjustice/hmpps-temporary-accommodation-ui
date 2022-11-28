import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import newBookingFactory from '../testutils/factories/newBooking'
import bookingExtensionFactory from '../testutils/factories/bookingExtension'
import bookingFactory from '../testutils/factories/booking'

import apPaths from '../paths/manage'
import taPaths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import roomFactory from '../testutils/factories/room'
import bedFactory from '../testutils/factories/bed'
import { formatStatus } from '../utils/bookingUtils'
import { formatLines } from '../utils/viewUtils'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')
jest.mock('../utils/bookingUtils')
jest.mock('../utils/viewUtils')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory)
  const token = 'SOME_TOKEN'

  const premisesId = 'premiseId'
  const bedId = 'bedId'

  const statusHtml = '<strong>Some status</strong>'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('create', () => {
    it('on success returns the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const postedBooking = await service.create(token, premisesId, newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.create).toHaveBeenCalledWith(premisesId, newBooking)
    })
  })

  describe('createForBedspace', () => {
    it('posts a new booking with a bed ID, and on success returns the created booking', async () => {
      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            id: bedId,
          }),
        ],
      })

      const postedBooking = await service.createForBedspace(token, premisesId, room, newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.create).toHaveBeenCalledWith(premisesId, {
        serviceName: 'temporary-accommodation',
        bedId,
        ...newBooking,
      })
    })
  })

  describe('find', () => {
    it('on success returns the booking that has been requested', async () => {
      const arrivalDate = new Date(2022, 2, 11)
      const departureDate = new Date(2022, 2, 12)

      const booking = bookingFactory.build({
        arrivalDate: arrivalDate.toISOString(),
        departureDate: departureDate.toISOString(),
      })

      bookingClient.find.mockResolvedValue(booking)

      const retrievedBooking = await service.find(token, premisesId, booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.find).toHaveBeenCalledWith(premisesId, booking.id)
    })
  })

  describe('getTableRowsForBedspace', () => {
    it('returns a sorted table view of the bookings for the given room', async () => {
      const booking1 = bookingFactory.build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2023-07-01',
      })
      const booking2 = bookingFactory.build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2022-11-14',
      })
      const booking3 = bookingFactory.build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2022-04-19',
      })

      const otherBedBooking = bookingFactory.build({
        bed: bedFactory.build({ id: 'other-bed-id' }),
      })

      ;(formatStatus as jest.MockedFunction<typeof formatStatus>).mockReturnValue(statusHtml)

      const bookings = [booking2, booking1, booking3, otherBedBooking]
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            id: bedId,
          }),
        ],
      })

      const rows = await service.getTableRowsForBedspace(token, premisesId, room)

      expect(rows).toEqual([
        [
          {
            text: booking1.person.crn,
          },
          {
            text: '1 Jul 23',
          },
          {
            text: DateFormats.isoDateToUIDate(booking1.departureDate, { format: 'short' }),
          },
          {
            html: statusHtml,
          },
          {
            html: `<a href="${taPaths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking1.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking1.person.crn
            }</span></a>`,
          },
        ],
        [
          {
            text: booking2.person.crn,
          },
          {
            text: '14 Nov 22',
          },
          {
            text: DateFormats.isoDateToUIDate(booking2.departureDate, { format: 'short' }),
          },
          {
            html: statusHtml,
          },
          {
            html: `<a href="${taPaths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking2.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking2.person.crn
            }</span></a>`,
          },
        ],
        [
          {
            text: booking3.person.crn,
          },
          {
            text: '19 Apr 22',
          },
          {
            text: DateFormats.isoDateToUIDate(booking3.departureDate, { format: 'short' }),
          },
          {
            html: statusHtml,
          },
          {
            html: `<a href="${taPaths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking3.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking3.person.crn
            }</span></a>`,
          },
        ],
      ])

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(formatStatus).toHaveBeenCalledTimes(3)
    })
  })

  describe('getBookingDetails', () => {
    it('returns a booking and a summary list of details for a provisional booking', async () => {
      const booking = bookingFactory.provisional().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(formatStatus as jest.MockedFunction<typeof formatStatus>).mockReturnValue(statusHtml)

      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBookingDetails(token, premisesId, booking.id)

      expect(result).toEqual({
        booking,
        summaryList: {
          rows: [
            {
              key: {
                text: 'Status',
              },
              value: {
                html: statusHtml,
              },
            },
            {
              key: {
                text: 'Start date',
              },
              value: {
                text: '21 March 2022',
              },
            },
            {
              key: {
                text: 'End date',
              },
              value: {
                text: '7 January 2023',
              },
            },
          ],
        },
      })

      expect(formatStatus).toHaveBeenCalledWith('provisional')
    })

    it('returns a booking and a summary list of details for a confirmed booking', async () => {
      const booking = bookingFactory.confirmed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07',
      })

      ;(formatStatus as jest.MockedFunction<typeof formatStatus>).mockReturnValue(statusHtml)
      ;(formatLines as jest.MockedFunction<typeof formatLines>).mockImplementation(text => text)

      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBookingDetails(token, premisesId, booking.id)

      expect(result).toEqual({
        booking,
        summaryList: {
          rows: [
            {
              key: {
                text: 'Status',
              },
              value: {
                html: statusHtml,
              },
            },
            {
              key: {
                text: 'Start date',
              },
              value: {
                text: '21 March 2022',
              },
            },
            {
              key: {
                text: 'End date',
              },
              value: {
                text: '7 January 2023',
              },
            },
            {
              key: {
                text: 'Notes',
              },
              value: {
                html: booking.confirmation.notes,
              },
            },
          ],
        },
      })

      expect(formatStatus).toHaveBeenCalledWith('confirmed')
      expect(formatLines).toHaveBeenCalledWith(booking.confirmation.notes)
    })
  })

  describe('listOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
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
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.groupedListOfBookingsForPremisesId(token, premisesId)

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

  describe('extendBooking', () => {
    it('on success returns the booking that has been extended', async () => {
      const booking = bookingExtensionFactory.build()
      bookingClient.extendBooking.mockResolvedValue(booking)
      const newDepartureDateObj = {
        newDepartureDate: new Date(2042, 13, 11).toISOString(),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      const extendedBooking = await service.extendBooking(token, premisesId, booking.id, newDepartureDateObj)

      expect(extendedBooking).toEqual(booking)
      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.extendBooking).toHaveBeenCalledWith(premisesId, booking.id, newDepartureDateObj)
    })
  })

  describe('bookingsToTableRows', () => {
    it('should convert bookings to table rows with an arrival date', () => {
      const booking1Date = new Date(2022, 10, 22)
      const booking2Date = new Date(2022, 2, 11)

      const bookings = [
        bookingFactory.build({ arrivalDate: booking1Date.toISOString() }),
        bookingFactory.build({ arrivalDate: booking2Date.toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'arrival')

      expect(results[0][0]).toEqual({ text: bookings[0].person.crn })
      expect(results[0][1]).toEqual({ text: DateFormats.dateObjtoUIDate(booking1Date) })
      expect(results[0][2]).toEqual({
        html: expect.stringMatching(apPaths.bookings.show({ premisesId, bookingId: bookings[0].id })),
      })

      expect(results[1][0]).toEqual({ text: bookings[1].person.crn })
      expect(results[1][1]).toEqual({ text: DateFormats.dateObjtoUIDate(booking2Date) })
      expect(results[1][2]).toEqual({
        html: expect.stringMatching(apPaths.bookings.show({ premisesId, bookingId: bookings[1].id })),
      })
    })

    it('should convert bookings to table rows with a departure date', () => {
      const booking1Date = new Date(2022, 10, 22)
      const booking2Date = new Date(2022, 2, 11)

      const bookings = [
        bookingFactory.build({ departureDate: booking1Date.toISOString() }),
        bookingFactory.build({ departureDate: booking2Date.toISOString() }),
      ]

      const results = service.bookingsToTableRows(bookings, premisesId, 'departure')

      expect(results[0][0]).toEqual({ text: bookings[0].person.crn })
      expect(results[0][1]).toEqual({ text: DateFormats.dateObjtoUIDate(booking1Date) })
      expect(results[0][2]).toEqual({
        html: expect.stringMatching(apPaths.bookings.show({ premisesId, bookingId: bookings[0].id })),
      })

      expect(results[1][0]).toEqual({ text: bookings[1].person.crn })
      expect(results[1][1]).toEqual({ text: DateFormats.dateObjtoUIDate(booking2Date) })
      expect(results[1][2]).toEqual({
        html: expect.stringMatching(apPaths.bookings.show({ premisesId, bookingId: bookings[1].id })),
      })
    })
  })

  describe('currentResidents', () => {
    it('should return table rows of the current residents', async () => {
      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(2)
      const currentResidents = bookingFactory.arrived().buildList(2)

      bookingClient.allBookingsForPremisesId.mockResolvedValue([...currentResidents, ...bookingsArrivingToday])

      const results = await service.currentResidents(token, premisesId)

      expect(results).toEqual(service.currentResidentsToTableRows(currentResidents, premisesId))

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })
})
