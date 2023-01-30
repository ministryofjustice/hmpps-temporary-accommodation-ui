import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import newBookingFactory from '../testutils/factories/newBooking'
import bookingFactory from '../testutils/factories/booking'

import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import roomFactory from '../testutils/factories/room'
import bedFactory from '../testutils/factories/bed'
import { formatStatus } from '../utils/bookingUtils'
import { CallConfig } from '../data/restClient'

jest.mock('../data/bookingClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/bookingUtils')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory)
  const token = 'some-token'
  const callConfig = { token } as CallConfig

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

      const postedBooking = await service.create(callConfig, premisesId, newBooking)
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

      const postedBooking = await service.createForBedspace(callConfig, premisesId, room, newBooking)
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

      const retrievedBooking = await service.find(callConfig, premisesId, booking.id)
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

      const rows = await service.getTableRowsForBedspace(callConfig, premisesId, room)

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

  describe('getBooking', () => {
    it('returns a booking', async () => {
      const booking = bookingFactory.build()
      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBooking(callConfig, premisesId, booking.id)

      expect(result).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.find).toHaveBeenCalledWith(premisesId, booking.id)
    })
  })
})
