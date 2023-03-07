import BookingClient from '../data/bookingClient'
import LostBedClient from '../data/lostBedClient'
import BookingService from './bookingService'

import bookingFactory from '../testutils/factories/booking'
import lostBedFactory from '../testutils/factories/lostBed'
import newBookingFactory from '../testutils/factories/newBooking'

import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import bedFactory from '../testutils/factories/bed'
import roomFactory from '../testutils/factories/room'
import { formatStatus } from '../utils/bookingUtils'
import { DateFormats } from '../utils/dateUtils'
import { statusTag as lostBedStatusTag } from '../utils/lostBedUtils'

jest.mock('../data/bookingClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/bookingUtils', () => ({
  ...jest.requireActual('../utils/bookingUtils'),
  formatStatus: jest.fn(),
}))
jest.mock('../data/lostBedClient')
jest.mock('../utils/lostBedUtils')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const lostBedClient = new LostBedClient(null) as jest.Mocked<LostBedClient>

  const bookingClientFactory = jest.fn()
  const lostBedClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory, lostBedClientFactory)
  const callConfig = { token: 'some-token' } as CallConfig

  const premisesId = 'premiseId'
  const bedId = 'bedId'

  const statusHtml = '<strong>Some status</strong>'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
    lostBedClientFactory.mockReturnValue(lostBedClient)
  })

  describe('create', () => {
    it('on success returns the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const postedBooking = await service.create(callConfig, premisesId, newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
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

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
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

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
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

      const lostBed1 = lostBedFactory.build({
        bedId,
        startDate: '2023-04-07',
        status: 'active',
      })

      const lostBed2 = lostBedFactory.build({
        bedId,
        startDate: '2022-10-07',
        status: 'active',
      })

      const lostBed3 = lostBedFactory.build({
        bedId,
        startDate: '2023-01-07',
        status: 'cancelled',
      })

      const otherLostBed = lostBedFactory.past().build({
        bedId: 'other-bed-id',
      })

      ;(formatStatus as jest.MockedFunction<typeof formatStatus>).mockReturnValue(statusHtml)
      ;(lostBedStatusTag as jest.MockedFunction<typeof lostBedStatusTag>).mockReturnValue(statusHtml)

      const bookings = [booking2, booking1, booking4, booking3, otherBedBooking]
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const lostBeds = [lostBed1, lostBed2, lostBed3, otherLostBed]
      lostBedClient.allLostBedsForPremisesId.mockResolvedValue(lostBeds)

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
            text: '-',
          },
          {
            text: '7 Apr 23',
          },
          {
            text: DateFormats.isoDateToUIDate(lostBed1.endDate, { format: 'short' }),
          },
          {
            html: lostBedStatusTag(lostBed1.status, 'bookingsAndVoids'),
          },
          {
            html: `<a href="${paths.lostBeds.show({
              premisesId,
              roomId: room.id,
              lostBedId: lostBed1.id,
            })}">View<span class="govuk-visually-hidden"> void booking</span></a>`,
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
            text: '-',
          },
          {
            text: '7 Oct 22',
          },
          {
            text: DateFormats.isoDateToUIDate(lostBed2.endDate, { format: 'short' }),
          },
          {
            html: lostBedStatusTag(lostBed2.status, 'bookingsAndVoids'),
          },
          {
            html: `<a href="${paths.lostBeds.show({
              premisesId,
              roomId: room.id,
              lostBedId: lostBed2.id,
            })}">View<span class="govuk-visually-hidden"> void booking</span></a>`,
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

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(lostBedStatusTag).toHaveBeenCalledTimes(4)
    })
  })

  describe('getBooking', () => {
    it('returns a booking', async () => {
      const booking = bookingFactory.build()
      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBooking(callConfig, premisesId, booking.id)

      expect(result).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.find).toHaveBeenCalledWith(premisesId, booking.id)
    })
  })
})
