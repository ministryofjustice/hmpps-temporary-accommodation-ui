import type { TableRow } from '@approved-premises/ui'
import type { BookingSearchStatus } from '@approved-premises/api'
import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { DateFormats } from '../utils/dateUtils'
import paths from '../paths/temporary-accommodation/manage'

export default class BookingSearchService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async getTableRowsForFindBooking(callConfig: CallConfig, status: BookingSearchStatus): Promise<Array<TableRow>> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const bookingSummaries = await bookingClient.search(status)

    return bookingSummaries.results.map(summary => {
      return [
        this.textValue(summary.person.name),
        this.textValue(summary.person.crn),
        this.textValue(summary.premises.addressLine1),
        this.dateSortValue(
          DateFormats.isoDateToUIDate(summary.booking.startDate, { format: 'short' }),
          summary.booking.startDate,
        ),
        this.dateSortValue(
          DateFormats.isoDateToUIDate(summary.booking.endDate, { format: 'short' }),
          summary.booking.endDate,
        ),
        this.htmlValue(
          `<a href="${paths.bookings.show({
            premisesId: summary.premises.id,
            roomId: summary.room.id,
            bookingId: summary.booking.id,
          })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${summary.person.crn}</span></a>`,
        ),
      ]
    })
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private dateSortValue(uiDate: string, isoDate: string) {
    return {
      text: uiDate,
      attributes: {
        'data-sort-value': `${isoDate}`,
      },
    }
  }
}
