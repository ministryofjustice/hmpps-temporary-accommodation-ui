import type { Arrival, NewArrival } from '@approved-premises/api'
import { Request } from 'express'
import type { RestClientBuilder, BookingClient } from '../data'

export default class ArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createArrival(req: Request, premisesId: string, bookingId: string, arrival: NewArrival): Promise<Arrival> {
    const bookingClient = this.bookingClientFactory(req)

    const confirmedArrival = await bookingClient.markAsArrived(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
