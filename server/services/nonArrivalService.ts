import type { NewNonarrival, Nonarrival } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class NonarrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createNonArrival(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    nonArrival: NewNonarrival,
  ): Promise<Nonarrival> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedNonArrival = await bookingClient.markNonArrival(premisesId, bookingId, nonArrival)

    return confirmedNonArrival
  }
}
