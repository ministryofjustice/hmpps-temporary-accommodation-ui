import type { Arrival } from 'approved-premises'
import type { RestClientBuilder, ArrivalClient } from '../data'

export default class ArrivalService {
  // TODO: We need to do some more work on authentication to work
  // out how to get this token, so let's stub for now
  token = 'FAKE_TOKEN'

  constructor(private readonly arrivalClientFactory: RestClientBuilder<ArrivalClient>) {}

  async createArrival(
    premisesId: string,
    bookingId: string,
    arrival: Omit<Arrival, 'id' | 'bookingId'>,
  ): Promise<Arrival> {
    const arrivalClient = this.arrivalClientFactory(this.token)

    const confirmedArrival = await arrivalClient.create(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
