import type {
  Arrival,
  NewBooking,
  Booking,
  BookingExtension,
  NewCancellation,
  Cancellation,
  NewDeparture,
  Departure,
  NonArrival,
} from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class BookingClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, data: NewBooking): Promise<Booking> {
    return (await this.restClient.post({ path: `/premises/${premisesId}/bookings`, data })) as Booking
  }

  async find(premisesId: string, bookingId: string): Promise<Booking> {
    return (await this.restClient.get({ path: `/premises/${premisesId}/bookings/${bookingId}` })) as Booking
  }

  async allBookingsForPremisesId(premisesId: string): Promise<Array<Booking>> {
    return (await this.restClient.get({ path: `/premises/${premisesId}/bookings` })) as Array<Booking>
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: BookingExtension): Promise<Booking> {
    return (await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/extensions`,
      data: bookingExtension,
    })) as Booking
  }

  async markAsArrived(
    premisesId: string,
    bookingId: string,
    arrival: Omit<Arrival, 'id' | 'bookingId'>,
  ): Promise<Arrival> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/arrivals`,
      data: arrival,
    })

    return response as Arrival
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation): Promise<Cancellation> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/cancellations`,
      data: cancellation,
    })

    return response as Cancellation
  }

  async findCancellation(premisesId: string, bookingId: string, departureId: string): Promise<Cancellation> {
    const response = await this.restClient.get({
      path: `/premises/${premisesId}/bookings/${bookingId}/cancellations/${departureId}`,
    })

    return response as Cancellation
  }

  async markDeparture(premisesId: string, bookingId: string, departure: NewDeparture): Promise<Departure> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/departures`,
      data: departure,
    })

    return response as Departure
  }

  async findDeparture(premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const response = await this.restClient.get({
      path: `/premises/${premisesId}/bookings/${bookingId}/departures/${departureId}`,
    })

    return response as Departure
  }

  async markNonArrival(
    premisesId: string,
    bookingId: string,
    nonArrival: Omit<NonArrival, 'id' | 'bookingId'>,
  ): Promise<NonArrival> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/non-arrivals`,
      data: nonArrival,
    })

    return response as NonArrival
  }
}
