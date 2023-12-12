import type {
  Arrival,
  Booking,
  BookingSearchSortField,
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
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { URLSearchParams } from 'url'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { appendQueryString } from '../utils/utils'
import RestClient, { CallConfig } from './restClient'
import { PaginatedResponse } from '../@types/ui'
import { BookingSearchResult, SortDirection } from '../@types/shared'

type searchResponse = {
  body: {
    results: Array<BookingSearchResult>
  }
  header: unknown
}

export default class BookingClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, data: NewBooking): Promise<Booking> {
    return (await this.restClient.post({
      path: this.bookingsPath(premisesId),
      data: { crn: data.crn.trim(), ...data },
    })) as Booking
  }

  async find(premisesId: string, bookingId: string): Promise<Booking> {
    return (await this.restClient.get({ path: this.bookingPath(premisesId, bookingId) })) as Booking
  }

  async allBookingsForPremisesId(premisesId: string): Promise<Array<Booking>> {
    return (await this.restClient.get({ path: this.bookingsPath(premisesId) })) as Array<Booking>
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension): Promise<Extension> {
    return (await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/extensions`,
      data: bookingExtension,
    })) as Extension
  }

  async markAsConfirmed(premisesId: string, bookingId: string, confirmation: NewConfirmation): Promise<Confirmation> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/confirmations`,
      data: confirmation,
    })

    return response as Confirmation
  }

  async markAsArrived(premisesId: string, bookingId: string, arrival: NewArrival): Promise<Arrival> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/arrivals`,
      data: arrival,
    })

    return response as Arrival
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation): Promise<Cancellation> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/cancellations`,
      data: cancellation,
    })

    return response as Cancellation
  }

  async findCancellation(premisesId: string, bookingId: string, departureId: string): Promise<Cancellation> {
    const response = await this.restClient.get({
      path: `${this.bookingPath(premisesId, bookingId)}/cancellations/${departureId}`,
    })

    return response as Cancellation
  }

  async markDeparture(premisesId: string, bookingId: string, departure: NewDeparture): Promise<Departure> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/departures`,
      data: departure,
    })

    return response as Departure
  }

  async findDeparture(premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const response = await this.restClient.get({
      path: `${this.bookingPath(premisesId, bookingId)}/departures/${departureId}`,
    })

    return response as Departure
  }

  async markNonArrival(premisesId: string, bookingId: string, nonArrival: NewNonarrival): Promise<Nonarrival> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/non-arrivals`,
      data: nonArrival,
    })

    return response as Nonarrival
  }

  async createTurnaround(premisesId: string, bookingId: string, turnaround: NewTurnaround): Promise<Turnaround> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/turnarounds`,
      data: turnaround,
    })

    return response as Turnaround
  }

  async search(
    status: BookingSearchApiStatus,
    page: number,
    sortField: BookingSearchSortField = 'endDate',
    sortOrder: SortDirection = 'desc',
  ): Promise<PaginatedResponse<BookingSearchResult>> {
    const path = appendQueryString(paths.bookings.search({ status }), {
      status,
      page: !page ? 1 : page, // also handles NaN & <1
      sortField,
      sortOrder: sortOrder === 'asc' ? 'ascending' : 'descending',
    })

    const response = await this.restClient.get({ path, raw: true })
    const { body, header } = response as searchResponse

    return {
      url: {
        params: new URLSearchParams(path),
      },
      data: body.results,
      pageNumber: Number(header['x-pagination-currentpage']),
      pageSize: Number(header['x-pagination-pagesize']),
      totalPages: Number(header['x-pagination-totalpages']),
      totalResults: Number(header['x-pagination-totalresults']),
    } as PaginatedResponse<BookingSearchResult>
  }

  private bookingsPath(premisesId: string): string {
    return `/premises/${premisesId}/bookings`
  }

  private bookingPath(premisesId: string, bookingId: string): string {
    return [this.bookingsPath(premisesId), bookingId].join('/')
  }
}
