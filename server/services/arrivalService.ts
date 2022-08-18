import type { Arrival } from 'approved-premises'
import type { RestClientBuilder, ArrivalClient } from '../data'
import Service from './service'

export default class ArrivalService extends Service {
  constructor(private readonly arrivalClientFactory: RestClientBuilder<ArrivalClient>) {
    super()
  }

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
