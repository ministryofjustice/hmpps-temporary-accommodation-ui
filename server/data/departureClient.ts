import type { Departure } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class DepartureClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('departureClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(
    premisesId: string,
    bookingId: string,
    departure: Omit<Departure, 'id' | 'bookingId'>,
  ): Promise<Departure> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/departures`,
      data: departure,
    })

    return response as Departure
  }

  async get(premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const response = await this.restClient.get({
      path: `/premises/${premisesId}/bookings/${bookingId}/departures/${departureId}`,
    })

    return response as Departure
  }
}
