import type { NonArrival } from 'approved-premises'
import type { RestClientBuilder, NonArrivalClient } from '../data'

export default class NonArrivalService {
  constructor(private readonly nonArrivalClientFactory: RestClientBuilder<NonArrivalClient>) {}

  async createNonArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: Omit<NonArrival, 'id' | 'bookingId'>,
  ): Promise<NonArrival> {
    const nonArrivalClient = this.nonArrivalClientFactory(token)

    const confirmedNonArrival = await nonArrivalClient.create(premisesId, bookingId, arrival)

    return confirmedNonArrival
  }
}
