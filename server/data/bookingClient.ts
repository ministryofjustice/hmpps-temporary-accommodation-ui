import type {
  Arrival,
  Booking,
  Cancellation,
  Cas3Arrival,
  Cas3Booking,
  Cas3BookingSearchResult,
  Cas3Cancellation,
  Cas3Confirmation,
  Cas3Departure,
  Cas3Extension,
  Cas3NewDeparture,
  Cas3Turnaround,
  Confirmation,
  Departure,
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
  results: Array<BookingSearchResult> | Array<Cas3BookingSearchResult>
}

export default class BookingClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, data: NewBooking) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Booking>({
        path: paths.premises.bookings.create({ premisesId }),
        data: { crn: data.crn.trim(), ...data },
      })
    }

    return this.restClient.post<Cas3Booking>({
      path: paths.cas3.premises.bookings.create({ premisesId }),
      data: { crn: data.crn.trim(), ...data },
    })
  }

  async find(premisesId: string, bookingId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<Booking>({ path: paths.premises.bookings.show({ premisesId, bookingId }) })
    }

    return this.restClient.get<Cas3Booking>({ path: paths.cas3.premises.bookings.show({ premisesId, bookingId }) })
  }

  async allBookingsForPremisesId(premisesId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<Array<Booking>>({ path: paths.premises.bookings.index({ premisesId }) })
    }

    return this.restClient.get<Array<Cas3Booking>>({ path: paths.cas3.premises.bookings.index({ premisesId }) })
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Extension>({
        path: paths.premises.bookings.extensions({ premisesId, bookingId }),
        data: bookingExtension,
      })
    }

    return this.restClient.post<Cas3Extension>({
      path: paths.cas3.premises.bookings.extensions({ premisesId, bookingId }),
      data: bookingExtension,
    })
  }

  async markAsConfirmed(premisesId: string, bookingId: string, confirmation: NewConfirmation) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Confirmation>({
        path: paths.premises.bookings.confirmations({ premisesId, bookingId }),
        data: confirmation,
      })
    }

    return this.restClient.post<Cas3Confirmation>({
      path: paths.cas3.premises.bookings.confirmations({ premisesId, bookingId }),
      data: confirmation,
    })
  }

  async markAsArrived(premisesId: string, bookingId: string, arrival: NewArrival) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Arrival>({
        path: paths.cas3.premises.bookings.arrivals({ premisesId, bookingId }),
        data: arrival,
      })
    }

    return this.restClient.post<Cas3Arrival>({
      path: paths.cas3.premises.bookings.arrivals({ premisesId, bookingId }),
      data: arrival,
    })
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Cancellation>({
        path: paths.premises.bookings.cancellations.create({ premisesId, bookingId }),
        data: cancellation,
      })
    }

    return this.restClient.post<Cas3Cancellation>({
      path: paths.cas3.premises.bookings.cancellations.create({ premisesId, bookingId }),
      data: cancellation,
    })
  }

  async findCancellation(premisesId: string, bookingId: string, cancellationId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<Cancellation>({
        path: paths.premises.bookings.cancellations.show({ premisesId, bookingId, cancellationId }),
      })
    }

    return this.restClient.get<Cas3Cancellation>({
      path: paths.cas3.premises.bookings.cancellations.show({ premisesId, bookingId, cancellationId }),
    })
  }

  async markDeparture(premisesId: string, bookingId: string, departure: Cas3NewDeparture) {
    return this.restClient.post<Cas3Departure>({
      path: paths.cas3.premises.bookings.departures.create({ premisesId, bookingId }),
      data: departure,
    })
  }

  async findDeparture(premisesId: string, bookingId: string, departureId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<Departure>({
        path: paths.premises.bookings.departures.show({ premisesId, bookingId, departureId }),
      })
    }

    return this.restClient.get<Cas3Departure>({
      path: paths.cas3.premises.bookings.departures.show({ premisesId, bookingId, departureId }),
    })
  }

  async createTurnaround(premisesId: string, bookingId: string, turnaround: NewTurnaround) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<Turnaround>({
        path: paths.premises.bookings.turnarounds.create({ premisesId, bookingId }),
        data: turnaround,
      })
    }

    return this.restClient.post<Cas3Turnaround>({
      path: paths.cas3.premises.bookings.turnarounds({ premisesId, bookingId }),
      data: turnaround,
    })
  }

  async search(
    status: BookingSearchApiStatus,
    params: BookingSearchParameters,
  ): Promise<PaginatedResponse<BookingSearchResult | Cas3BookingSearchResult>> {
    const basePath = config.flags.enableCas3v2Api ? paths.cas3.bookings.search : paths.bookings.search

    const path = appendQueryString(basePath({ status }), {
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
