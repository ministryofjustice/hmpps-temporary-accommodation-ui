import type { NonArrival } from 'approved-premises'
import type { RestClientBuilder, NonArrivalClient } from '../data'
import Service from './service'

export default class NonArrivalService extends Service {
  constructor(private readonly nonArrivalClientFactory: RestClientBuilder<NonArrivalClient>) {
    super()
  }

  async createNonArrival(
    premisesId: string,
    bookingId: string,
    arrival: Omit<NonArrival, 'id' | 'bookingId'>,
  ): Promise<NonArrival> {
    const nonArrivalClient = this.nonArrivalClientFactory(this.token)

    const confirmedNonArrival = await nonArrivalClient.create(premisesId, bookingId, arrival)

    return confirmedNonArrival
  }
}
