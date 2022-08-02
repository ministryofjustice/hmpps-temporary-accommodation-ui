import type { NonArrival } from 'approved-premises'
import type { RestClientBuilder, NonArrivalClient } from '../data'

export default class NonArrivalService {
  // TODO: We need to do some more work on authentication to work
  // out how to get this token, so let's stub for now
  token = 'FAKE_TOKEN'

  constructor(private readonly nonArrivalClientFactory: RestClientBuilder<NonArrivalClient>) {}

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
