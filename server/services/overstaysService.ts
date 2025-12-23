import { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import { NewOverstay, Overstay } from '../data/bookingClient'

export default class OverstaysService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createOverstay(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    overstay: NewOverstay,
  ): Promise<Overstay> {
    const bookingClient = this.bookingClientFactory(callConfig)
    return bookingClient.overstayBooking(premisesId, bookingId, overstay)
  }
}
