import type {
  NewArrival,
  Arrival,
  Booking,
  NewBooking,
  Extension,
  NewExtension,
  Cancellation,
  NewCancellation,
  Departure,
  Nonarrival,
  NewDeparture,
  NewConfirmation,
  Confirmation,
  NewNonarrival,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class BookingClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, data: NewBooking): Promise<Booking> {
    return (await this.restClient.post({ path: this.bookingsPath(premisesId), data })) as Booking
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

  private bookingsPath(premisesId: string): string {
    return `/premises/${premisesId}/bookings`
  }

  private bookingPath(premisesId: string, bookingId: string): string {
    return [this.bookingsPath(premisesId), bookingId].join('/')
  }
}
