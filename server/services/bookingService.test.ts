import BookingClient from '../data/bookingClient'
import LostBedClient from '../data/lostBedClient'
import BookingService from './bookingService'

import { bedFactory, bookingFactory, lostBedFactory, newBookingFactory, roomFactory } from '../testutils/factories'

import config from '../config'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import { statusTag } from '../utils/bookingUtils'
import { DateFormats } from '../utils/dateUtils'
import { statusTag as lostBedStatusTag } from '../utils/lostBedUtils'

jest.mock('../data/bookingClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/bookingUtils', () => ({
  ...jest.requireActual('../utils/bookingUtils'),
  statusTag: jest.fn(),
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
        enableTurnarounds: !config.flags.turnaroundsDisabled,
        ...newBooking,
      })
    })
  })

  describe('getTableRowsForBedspace', () => {
    describe('when turnarounds are enabled', () => {
      beforeAll(() => {
        config.flags.turnaroundsDisabled = false
      })

      it('returns a sorted table view of the bookings for the given room, using the effective end date for each booking', async () => {
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

        ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)
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
              text: DateFormats.isoDateToUIDate(booking1.effectiveEndDate, { format: 'short' }),
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
              text: DateFormats.isoDateToUIDate(booking2.effectiveEndDate, { format: 'short' }),
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
              text: DateFormats.isoDateToUIDate(booking3.effectiveEndDate, { format: 'short' }),
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
              text: DateFormats.isoDateToUIDate(booking4.effectiveEndDate, { format: 'short' }),
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

        expect(statusTag).toHaveBeenCalledTimes(4)
        expect(lostBedStatusTag).toHaveBeenCalledTimes(4)
      })

      it('uses the departure date where no effective end date is given', async () => {
        const booking = bookingFactory.provisional().build({
          bed: bedFactory.build({ id: bedId }),
          arrivalDate: '2023-07-01',
        })

        delete booking.effectiveEndDate
        ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)

        bookingClient.allBookingsForPremisesId.mockResolvedValue([booking])
        lostBedClient.allLostBedsForPremisesId.mockResolvedValue([])

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
              text: booking.person.crn,
            },
            {
              text: '1 Jul 23',
            },
            {
              text: DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' }),
            },
            {
              html: statusHtml,
            },
            {
              html: `<a href="${paths.bookings.show({
                premisesId,
                roomId: room.id,
                bookingId: booking.id,
              })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
                booking.person.crn
              }</span></a>`,
            },
          ],
        ])
      })
    })

    describe('when turnarounds are disabled', () => {
      beforeAll(() => {
        config.flags.turnaroundsDisabled = true
      })

      it('uses the departure date for each booking', async () => {
        const booking = bookingFactory.provisional().build({
          bed: bedFactory.build({ id: bedId }),
          arrivalDate: '2023-07-01',
        })

        ;(statusTag as jest.MockedFunction<typeof statusTag>).mockReturnValue(statusHtml)

        bookingClient.allBookingsForPremisesId.mockResolvedValue([booking])
        lostBedClient.allLostBedsForPremisesId.mockResolvedValue([])

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
              text: booking.person.crn,
            },
            {
              text: '1 Jul 23',
            },
            {
              text: DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' }),
            },
            {
              html: statusHtml,
            },
            {
              html: `<a href="${paths.bookings.show({
                premisesId,
                roomId: room.id,
                bookingId: booking.id,
              })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
                booking.person.crn
              }</span></a>`,
            },
          ],
        ])
      })
    })
  })

  describe('getListingEntries', () => {
    it('returns a sorted list of booking entries and active lost bed entries', async () => {
      const bed = bedFactory.build({
        id: bedId,
      })

      const booking1 = bookingFactory.build({
        arrivalDate: '2021-02-17',
        bed,
      })

      const booking2 = bookingFactory.build({
        arrivalDate: '2023-12-13',
        bed,
      })

      const lostBed1 = lostBedFactory.active().build({
        startDate: '2022-05-09',
        bedId,
      })

      const lostBed2 = lostBedFactory.active().build({
        startDate: '2024-01-01',
        bedId,
      })

      const room = roomFactory.build({
        beds: [bed],
      })

      const lostBedInactive = lostBedFactory.cancelled().build()

      bookingClient.allBookingsForPremisesId.mockResolvedValue([booking2, booking1])
      lostBedClient.allLostBedsForPremisesId.mockResolvedValue([lostBed2, lostBedInactive, lostBed1])

      const result = await service.getListingEntries(callConfig, premisesId, room)

      expect(result).toEqual([
        expect.objectContaining({
          path: paths.lostBeds.show({ premisesId, roomId: room.id, lostBedId: lostBed2.id }),
          body: lostBed2,
          type: 'lost-bed',
        }),
        expect.objectContaining({
          path: paths.bookings.show({ premisesId, roomId: room.id, bookingId: booking2.id }),
          body: booking2,
          type: 'booking',
        }),
        expect.objectContaining({
          path: paths.lostBeds.show({ premisesId, roomId: room.id, lostBedId: lostBed1.id }),
          body: lostBed1,
          type: 'lost-bed',
        }),
        expect.objectContaining({
          path: paths.bookings.show({ premisesId, roomId: room.id, bookingId: booking1.id }),
          body: booking1,
          type: 'booking',
        }),
      ])

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
      expect(lostBedClient.allLostBedsForPremisesId).toHaveBeenCalledWith(premisesId)
    })

    it('ignores bookings and lost beds for other rooms', async () => {
      const bed = bedFactory.build({
        id: bedId,
      })

      const otherBed = bedFactory.build({
        id: 'other-bed-id',
      })

      const booking = bookingFactory.build({
        bed: otherBed,
      })

      const lostBed = lostBedFactory.active().build({
        bedId: 'other-bed-id',
      })

      const room = roomFactory.build({
        beds: [bed],
      })

      bookingClient.allBookingsForPremisesId.mockResolvedValue([booking])
      lostBedClient.allLostBedsForPremisesId.mockResolvedValue([lostBed])

      const result = await service.getListingEntries(callConfig, premisesId, room)

      expect(result).toEqual([])

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
      expect(lostBedClient.allLostBedsForPremisesId).toHaveBeenCalledWith(premisesId)
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
