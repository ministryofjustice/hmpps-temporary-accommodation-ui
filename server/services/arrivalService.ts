import type { Arrival } from 'approved-premises'
import type { RestClientBuilder, BookingClient } from '../data'

export default class ArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: Omit<Arrival, 'id' | 'bookingId'>,
  ): Promise<Arrival> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedArrival = await bookingClient.markAsArrived(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
