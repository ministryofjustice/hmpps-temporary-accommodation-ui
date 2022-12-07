import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import newBookingFactory from '../testutils/factories/newBooking'
import bookingFactory from '../testutils/factories/booking'

import paths from '../paths/temporary-accommodation/manage'
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
      const booking1 = bookingFactory.provisional().build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2023-07-01',
      })
      const booking2 = bookingFactory.confirmed().build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2022-11-14',
      })
      const booking3 = bookingFactory.arrived().build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2022-04-19',
      })
      const booking4 = bookingFactory.departed().build({
        bed: bedFactory.build({ id: bedId }),
        arrivalDate: '2022-01-03',
      })

      const otherBedBooking = bookingFactory.build({
        bed: bedFactory.build({ id: 'other-bed-id' }),
      })

      ;(formatStatus as jest.MockedFunction<typeof formatStatus>).mockReturnValue(statusHtml)

      const bookings = [booking2, booking1, booking4, booking3, otherBedBooking]
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
            html: `<a href="${paths.bookings.show({
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
            html: `<a href="${paths.bookings.show({
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
            html: `<a href="${paths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking3.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking3.person.crn
            }</span></a>`,
          },
        ],
        [
          {
            text: booking4.person.crn,
          },
          {
            text: '3 Jan 22',
          },
          {
            text: DateFormats.isoDateToUIDate(booking4.departureDate, { format: 'short' }),
          },
          {
            html: statusHtml,
          },
          {
            html: `<a href="${paths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking4.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking4.person.crn
            }</span></a>`,
          },
        ],
      ])

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(formatStatus).toHaveBeenCalledTimes(4)
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

    it('returns a booking and a summary list of details for an arrived booking', async () => {
      const booking = bookingFactory.arrived().build({
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
                text: 'Arrival date',
              },
              value: {
                text: '21 March 2022',
              },
            },
            {
              key: {
                text: 'Expected departure date',
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
                html: booking.arrival.notes,
              },
            },
          ],
        },
      })

      expect(formatStatus).toHaveBeenCalledWith('arrived')
      expect(formatLines).toHaveBeenCalledWith(booking.arrival.notes)
    })

    it('returns a booking and a summary list of details for a departed booking', async () => {
      const booking = bookingFactory.departed().build({
        arrivalDate: '2022-03-21',
        departureDate: '2023-01-07T00:00:00.000Z',
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
                text: 'Departure date',
              },
              value: {
                text: '7 January 2023',
              },
            },
            {
              key: {
                text: 'Departure reason',
              },
              value: {
                text: booking.departure.reason.name,
              },
            },
            {
              key: {
                text: 'Move on category',
              },
              value: {
                text: booking.departure.moveOnCategory.name,
              },
            },
            {
              key: {
                text: 'Notes',
              },
              value: {
                html: booking.departure.notes,
              },
            },
          ],
        },
      })

      expect(formatStatus).toHaveBeenCalledWith('departed')
      expect(formatLines).toHaveBeenCalledWith(booking.departure.notes)
    })
  })
})
