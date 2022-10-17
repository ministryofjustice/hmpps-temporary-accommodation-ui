import type { Nonarrival } from '@approved-premises/api'
import type { RestClientBuilder, BookingClient } from '../data'

export default class NonArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createNonArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: Omit<Nonarrival, 'id' | 'bookingId'>,
  ): Promise<Nonarrival> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedNonArrival = await bookingClient.markNonArrival(premisesId, bookingId, arrival)

    return confirmedNonArrival
  }
}
