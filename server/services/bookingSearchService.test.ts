import BookingClient from '../data/bookingClient'
import BookingSearchService from './bookingSearchService'
import { CallConfig } from '../data/restClient'
import { bookingSearchResultFactory, bookingSearchResultsFactory } from '../testutils/factories/index'
import { DateFormats } from '../utils/dateUtils'
import paths from '../paths/temporary-accommodation/manage'

jest.mock('../data/bookingClient')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()

  const service = new BookingSearchService(bookingClientFactory)
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('getTableRowsForFindBooking', () => {
    it('returns a table view of all returned bookings', async () => {
      const booking1 = bookingSearchResultFactory.build()
      const booking2 = bookingSearchResultFactory.build()
      const booking3 = bookingSearchResultFactory.build()
      const bookings = bookingSearchResultsFactory.build({ resultsCount: 3, results: [booking1, booking2, booking3] })

      bookingClient.search.mockResolvedValue(bookings)

      const rows = await service.getTableRowsForFindBooking(callConfig, 'provisional')

      expect(rows).toEqual([
        [
          { text: booking1.person.name },
          { text: booking1.person.crn },
          { text: booking1.premises.addressLine1 },
          { text: DateFormats.isoDateToUIDate(booking1.booking.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(booking1.booking.endDate, { format: 'short' }) },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking1.premises.id,
              roomId: booking1.room.id,
              bookingId: booking1.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking1.person.crn
            }</span></a>`,
          },
        ],
        [
          { text: booking2.person.name },
          { text: booking2.person.crn },
          { text: booking2.premises.addressLine1 },
          { text: DateFormats.isoDateToUIDate(booking2.booking.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(booking2.booking.endDate, { format: 'short' }) },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking2.premises.id,
              roomId: booking2.room.id,
              bookingId: booking2.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking2.person.crn
            }</span></a>`,
          },
        ],
        [
          { text: booking3.person.name },
          { text: booking3.person.crn },
          { text: booking3.premises.addressLine1 },
          { text: DateFormats.isoDateToUIDate(booking3.booking.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(booking3.booking.endDate, { format: 'short' }) },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking3.premises.id,
              roomId: booking3.room.id,
              bookingId: booking3.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking3.person.crn
            }</span></a>`,
          },
        ],
      ])
    })

    it('returns an empty array if no bookings exist', async () => {
      const bookings = bookingSearchResultsFactory.build({ resultsCount: 0, results: [] })
      bookingClient.search.mockResolvedValue(bookings)

      const rows = await service.getTableRowsForFindBooking(callConfig, 'provisional')

      expect(rows).toEqual([])
    })
  })
})