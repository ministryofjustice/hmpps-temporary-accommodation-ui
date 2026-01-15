import type {
  Cas3Arrival,
  Cas3Booking,
  Cas3BookingSearchResult,
  Cas3Cancellation,
  Cas3Confirmation,
  Cas3Departure,
  Cas3Extension,
  Cas3NewBooking,
  Cas3NewDeparture,
  Cas3Overstay,
  Cas3Turnaround,
  NewCas3Arrival as NewArrival,
  NewCancellation,
  NewConfirmation,
  NewExtension,
  NewOverstay,
  NewTurnaround,
} from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchParameters, PaginatedResponse } from '@approved-premises/ui'
import { URLSearchParams } from 'url'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { appendQueryString } from '../utils/utils'
import RestClient, { CallConfig } from './restClient'

type SearchResponse = {
  results: Array<Cas3BookingSearchResult>
}

export default class BookingClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, data: Cas3NewBooking) {
    return this.restClient.post<Cas3Booking>({
      path: paths.cas3.premises.bookings.create({ premisesId }),
      data: { ...data, crn: data.crn.trim() },
    })
  }

  async find(premisesId: string, bookingId: string) {
    return this.restClient.get<Cas3Booking>({ path: paths.cas3.premises.bookings.show({ premisesId, bookingId }) })
  }

  async allBookingsForPremisesId(premisesId: string) {
    return this.restClient.get<Array<Cas3Booking>>({ path: paths.cas3.premises.bookings.index({ premisesId }) })
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension) {
    return this.restClient.post<Cas3Extension>({
      path: paths.cas3.premises.bookings.extensions({ premisesId, bookingId }),
      data: bookingExtension,
    })
  }

  async overstayBooking(premisesId: string, bookingId: string, overstay: NewOverstay): Promise<Cas3Overstay> {
    return this.restClient.post<Cas3Overstay>({
      path: paths.cas3.premises.bookings.overstays({ premisesId, bookingId }),
      data: overstay,
    })
  }

  async markAsConfirmed(premisesId: string, bookingId: string, confirmation: NewConfirmation) {
    return this.restClient.post<Cas3Confirmation>({
      path: paths.cas3.premises.bookings.confirmations({ premisesId, bookingId }),
      data: confirmation,
    })
  }

  async markAsArrived(premisesId: string, bookingId: string, arrival: NewArrival) {
    return this.restClient.post<Cas3Arrival>({
      path: paths.cas3.premises.bookings.arrivals({ premisesId, bookingId }),
      data: arrival,
    })
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation) {
    return this.restClient.post<Cas3Cancellation>({
      path: paths.cas3.premises.bookings.cancellations.create({ premisesId, bookingId }),
      data: cancellation,
    })
  }

  async markDeparture(premisesId: string, bookingId: string, departure: Cas3NewDeparture) {
    return this.restClient.post<Cas3Departure>({
      path: paths.cas3.premises.bookings.departures.create({ premisesId, bookingId }),
      data: departure,
    })
  }

  async createTurnaround(premisesId: string, bookingId: string, turnaround: NewTurnaround) {
    return this.restClient.post<Cas3Turnaround>({
      path: paths.cas3.premises.bookings.turnarounds({ premisesId, bookingId }),
      data: turnaround,
    })
  }

  async search(
    status: BookingSearchApiStatus,
    params: BookingSearchParameters,
  ): Promise<PaginatedResponse<Cas3BookingSearchResult>> {
    const path = appendQueryString(paths.cas3.bookings.search({ status }), {
      status,
      crnOrName: params.crnOrName,
      page: !params.page ? 1 : params.page, // also handles NaN & <1
      sortField: params.sortBy || 'endDate',
      sortDirection: params.sortDirection || 'desc',
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
