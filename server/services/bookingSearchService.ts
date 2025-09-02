import type { BookingSearchApiStatus, BookingSearchParameters, TableRow } from '@approved-premises/ui'
import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import { PaginatedResponse } from '../@types/ui'

export default class BookingSearchService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async getTableRowsForFindBooking(
    callConfig: CallConfig,
    status: BookingSearchApiStatus,
    params: BookingSearchParameters,
  ): Promise<PaginatedResponse<TableRow>> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const paginatedResponse = await bookingClient.search(status, params)

    const { data, pageNumber, pageSize, totalPages, totalResults, url } = paginatedResponse

    return {
      pageNumber,
      pageSize,
      totalPages,
      totalResults,
      url,
      data: data.map(summary => {
        return [
          this.textValue(summary.person.name || 'Limited access offender'),
          this.textValue(summary.person.crn),
          this.textValue(summary.premises.addressLine1),
          this.dateSortValue(DateFormats.isoDateToUIDate(summary.booking.startDate), summary.booking.startDate),
          this.dateSortValue(DateFormats.isoDateToUIDate(summary.booking.endDate), summary.booking.endDate),
          this.htmlValue(
            `<a href="${paths.bookings.show({
              premisesId: summary.premises.id,
              bedspaceId: summary.bed.id,
              bookingId: summary.booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${summary.person.crn}</span></a>`,
          ),
        ]
      }),
    }
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
