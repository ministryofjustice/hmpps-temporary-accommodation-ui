import type {
  Arrival,
  Booking,
  Cancellation,
  Confirmation,
  Departure,
  Extension,
  NewCas3Arrival as NewArrival,
  NewBooking,
  NewCancellation,
  NewConfirmation,
  NewDeparture,
  NewExtension,
  NewNonarrival,
  NewTurnaround,
  Nonarrival,
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
      path: this.bookingsPath(premisesId),
      data: { crn: data.crn.trim(), ...data },
    })
  }

  async find(premisesId: string, bookingId: string) {
    return this.restClient.get<Booking>({ path: this.bookingPath(premisesId, bookingId) })
  }

  async allBookingsForPremisesId(premisesId: string) {
    return this.restClient.get<Array<Booking>>({ path: this.bookingsPath(premisesId) })
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension) {
    return this.restClient.post<Extension>({
      path: `/premises/${premisesId}/bookings/${bookingId}/extensions`,
      data: bookingExtension,
    })
  }

  async markAsConfirmed(premisesId: string, bookingId: string, confirmation: NewConfirmation) {
    return this.restClient.post<Confirmation>({
      path: `${this.bookingPath(premisesId, bookingId)}/confirmations`,
      data: confirmation,
    })
  }

  async markAsArrived(premisesId: string, bookingId: string, arrival: NewArrival) {
    return this.restClient.post<Arrival>({
      path: `${this.bookingPath(premisesId, bookingId)}/arrivals`,
      data: arrival,
    })
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation) {
    return this.restClient.post<Cancellation>({
      path: `${this.bookingPath(premisesId, bookingId)}/cancellations`,
      data: cancellation,
    })
  }

  async findCancellation(premisesId: string, bookingId: string, departureId: string) {
    return this.restClient.get<Cancellation>({
      path: `${this.bookingPath(premisesId, bookingId)}/cancellations/${departureId}`,
    })
  }

  async markDeparture(premisesId: string, bookingId: string, departure: NewDeparture) {
    return this.restClient.post<Departure>({
      path: `${this.bookingPath(premisesId, bookingId)}/departures`,
      data: departure,
    })
  }

  async findDeparture(premisesId: string, bookingId: string, departureId: string) {
    return this.restClient.get<Departure>({
      path: `${this.bookingPath(premisesId, bookingId)}/departures/${departureId}`,
    })
  }

  async markNonArrival(premisesId: string, bookingId: string, nonArrival: NewNonarrival) {
    return this.restClient.post<Nonarrival>({
      path: `${this.bookingPath(premisesId, bookingId)}/non-arrivals`,
      data: nonArrival,
    })
  }

  async createTurnaround(premisesId: string, bookingId: string, turnaround: NewTurnaround) {
    return this.restClient.post<Turnaround>({
      path: `${this.bookingPath(premisesId, bookingId)}/turnarounds`,
      data: turnaround,
    })
  }

  async search(
    status: BookingSearchApiStatus,
    params: BookingSearchParameters,
  ): Promise<PaginatedResponse<BookingSearchResult>> {
    const path = appendQueryString(paths.bookings.search({ status }), {
      status,
      crn: params.crn,
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

  private bookingsPath(premisesId: string): string {
    return `/premises/${premisesId}/bookings`
  }

  private bookingPath(premisesId: string, bookingId: string): string {
    return [this.bookingsPath(premisesId), bookingId].join('/')
  }
}
