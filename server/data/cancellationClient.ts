import type { Cancellation, NewCancellation } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class CancellationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('cancellationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, bookingId: string, cancellation: NewCancellation): Promise<Cancellation> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/cancellations`,
      data: cancellation,
    })

    return response as Cancellation
  }

  async get(premisesId: string, bookingId: string, departureId: string): Promise<Cancellation> {
    const response = await this.restClient.get({
      path: `/premises/${premisesId}/bookings/${bookingId}/cancellations/${departureId}`,
    })

    return response as Cancellation
  }
}
