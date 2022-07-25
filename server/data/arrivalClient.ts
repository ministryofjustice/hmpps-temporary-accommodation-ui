import type { Arrival } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class ArrivalClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('arrivalClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, bookingId: string, arrival: Omit<Arrival, 'id' | 'bookingId'>): Promise<Arrival> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/arrivals`,
      data: arrival,
    })

    return response as Arrival
  }
}
