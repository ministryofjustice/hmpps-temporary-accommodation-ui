import type { Arrival } from 'approved-premises'
import type { RestClientBuilder, ArrivalClient } from '../data'

export default class ArrivalService {
  constructor(private readonly arrivalClientFactory: RestClientBuilder<ArrivalClient>) {}

  async createArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: Omit<Arrival, 'id' | 'bookingId'>,
  ): Promise<Arrival> {
    const arrivalClient = this.arrivalClientFactory(token)

    const confirmedArrival = await arrivalClient.create(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
