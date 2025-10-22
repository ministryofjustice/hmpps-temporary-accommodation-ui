import type {
  Arrival,
  Booking,
  Cancellation,
  Cas3Departure,
  Cas3NewDeparture,
  Confirmation,
  Extension,
  NewCas3Arrival as NewArrival,
  NewBooking,
  NewCancellation,
  NewConfirmation,
  NewExtension,
  NewTurnaround,
  Turnaround,
} from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchParameters } from '@approved-premises/ui'
import { URLSearchParams } from 'url'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { appendQueryString } from '../utils/utils'
import RestClient, { CallConfig } from './restClient'
import { PaginatedResponse } from '../@types/ui'
import { BookingSearchResult } from '../@types/shared'

type SearchResponse = {
  results: Array<BookingSearchResult>
}

export default class BookingClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, data: NewBooking) {
    return this.restClient.post<Booking>({
      path: paths.premises.bookings.create({ premisesId }),
      data: { crn: data.crn.trim(), ...data },
    })
  }

  async find(premisesId: string, bookingId: string) {
    return this.restClient.get<Booking>({ path: paths.premises.bookings.show({ premisesId, bookingId }) })
  }

  async allBookingsForPremisesId(premisesId: string) {
    return this.restClient.get<Array<Booking>>({ path: paths.premises.bookings.index({ premisesId }) })
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension) {
    return this.restClient.post<Extension>({
      path: paths.premises.bookings.extensions({ premisesId, bookingId }),
      data: bookingExtension,
    })
  }

  async markAsConfirmed(premisesId: string, bookingId: string, confirmation: NewConfirmation) {
    return this.restClient.post<Confirmation>({
      path: paths.premises.bookings.confirmations({ premisesId, bookingId }),
      data: confirmation,
    })
  }

  async markAsArrived(premisesId: string, bookingId: string, arrival: NewArrival) {
    return this.restClient.post<Arrival>({
      path: paths.cas3.premises.bookings.arrivals({ premisesId, bookingId }),
      data: arrival,
    })
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation) {
    return this.restClient.post<Cancellation>({
      path: paths.premises.bookings.cancellations.create({ premisesId, bookingId }),
      data: cancellation,
    })
  }

  async markDeparture(premisesId: string, bookingId: string, departure: Cas3NewDeparture) {
    return this.restClient.post<Cas3Departure>({
      path: paths.cas3.premises.bookings.departures({ premisesId, bookingId }),
      data: departure,
    })
  }

  async createTurnaround(premisesId: string, bookingId: string, turnaround: NewTurnaround) {
    return this.restClient.post<Turnaround>({
      path: paths.premises.bookings.turnarounds.create({ premisesId, bookingId }),
      data: turnaround,
    })
  }

  async search(
    status: BookingSearchApiStatus,
    params: BookingSearchParameters,
  ): Promise<PaginatedResponse<BookingSearchResult>> {
    const path = appendQueryString(paths.bookings.search({ status }), {
      status,
      crnOrName: params.crnOrName,
      page: !params.page ? 1 : params.page, // also handles NaN & <1
      sortField: params.sortBy || 'endDate',
      sortOrder: params.sortDirection === 'asc' ? 'ascending' : 'descending',
    })

    const response = await this.restClient.get<SearchResponse>({ path }, true)
    const { body, header } = response

    return {
      url: {
        params: new URLSearchParams(path),
      },
      data: body.results,
      pageNumber: Number(header['x-pagination-currentpage']),
      pageSize: Number(header['x-pagination-pagesize']),
      totalPages: Number(header['x-pagination-totalpages']),
      totalResults: Number(header['x-pagination-totalresults']),
    }
  }
}
