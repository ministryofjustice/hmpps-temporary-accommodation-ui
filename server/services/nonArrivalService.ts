import type { NewNonarrival, Nonarrival } from '@approved-premises/api'
import { Request } from 'express'
import type { RestClientBuilder, BookingClient } from '../data'

export default class NonarrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createNonArrival(
    req: Request,
    premisesId: string,
    bookingId: string,
    nonArrival: NewNonarrival,
  ): Promise<Nonarrival> {
    const bookingClient = this.bookingClientFactory(req)

    const confirmedNonArrival = await bookingClient.markNonArrival(premisesId, bookingId, nonArrival)

    return confirmedNonArrival
  }
}
