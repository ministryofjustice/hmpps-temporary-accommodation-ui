import { Cas3Overstay, NewOverstay } from '@approved-premises/api'
import { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class OverstaysService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createOverstay(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    overstay: NewOverstay,
  ): Promise<Cas3Overstay> {
    const bookingClient = this.bookingClientFactory(callConfig)
    return bookingClient.overstayBooking(premisesId, bookingId, overstay)
  }
}
