import type { Cas3Arrival, NewCas3Arrival as NewArrival } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class ArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createArrival(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    arrival: NewArrival,
  ): Promise<Cas3Arrival> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedArrival = await bookingClient.markAsArrived(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
