import type { NonArrival } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class NonArrivalClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('nonArrivalClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(
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
