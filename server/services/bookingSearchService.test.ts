import BookingClient from '../data/bookingClient'
import BookingSearchService from './bookingSearchService'
import { CallConfig } from '../data/restClient'
import { cas3BookingSearchResultFactory, cas3BookingSearchResultsFactory } from '../testutils/factories/index'
import { DateFormats } from '../utils/dateUtils'
import paths from '../paths/temporary-accommodation/manage'
import cas3BookingSearchResultPersonSummaryFactory from '../testutils/factories/cas3BookingSearchResultPersonSummary'

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
      const booking1 = cas3BookingSearchResultFactory.build()
      const booking2 = cas3BookingSearchResultFactory.build()
      const booking3 = cas3BookingSearchResultFactory.build({
        person: cas3BookingSearchResultPersonSummaryFactory.build({ name: '' }),
      })
      const bookings = cas3BookingSearchResultsFactory.build({
        totalResults: 3,
        totalPages: 1,
        pageNumber: 1,
        pageSize: 10,
        data: [booking1, booking2, booking3],
      })

      bookingClient.search.mockResolvedValue(bookings)

      const response = await service.getTableRowsForFindBooking(callConfig, 'provisional', { page: 1 })

      expect(response.data).toEqual([
        [
          { text: booking1.person.name },
          { text: booking1.person.crn },
          { text: booking1.premises.addressLine1 },
          {
            text: DateFormats.isoDateToUIDate(booking1.booking.startDate),
            attributes: {
              'data-sort-value': booking1.booking.startDate,
            },
          },
          {
            text: DateFormats.isoDateToUIDate(booking1.booking.endDate),
            attributes: {
              'data-sort-value': booking1.booking.endDate,
            },
          },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking1.premises.id,
              bedspaceId: booking1.bedspace.id,
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
          {
            text: DateFormats.isoDateToUIDate(booking2.booking.startDate),
            attributes: {
              'data-sort-value': booking2.booking.startDate,
            },
          },
          {
            text: DateFormats.isoDateToUIDate(booking2.booking.endDate),
            attributes: {
              'data-sort-value': booking2.booking.endDate,
            },
          },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking2.premises.id,
              bedspaceId: booking2.bedspace.id,
              bookingId: booking2.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking2.person.crn
            }</span></a>`,
          },
        ],
        [
          { text: 'Limited access offender' },
          { text: booking3.person.crn },
          { text: booking3.premises.addressLine1 },
          {
            text: DateFormats.isoDateToUIDate(booking3.booking.startDate),
            attributes: {
              'data-sort-value': booking3.booking.startDate,
            },
          },
          {
            text: DateFormats.isoDateToUIDate(booking3.booking.endDate),
            attributes: {
              'data-sort-value': booking3.booking.endDate,
            },
          },
          {
            html: `<a href="${paths.bookings.show({
              premisesId: booking3.premises.id,
              bedspaceId: booking3.bedspace.id,
              bookingId: booking3.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${
              booking3.person.crn
            }</span></a>`,
          },
        ],
      ])
    })

    it('returns an empty array if no bookings exist', async () => {
      const bookings = cas3BookingSearchResultsFactory.build({ data: [] })
      bookingClient.search.mockResolvedValue(bookings)

      const response = await service.getTableRowsForFindBooking(callConfig, 'provisional', {})

      expect(response.data).toEqual([])
    })
  })
})
