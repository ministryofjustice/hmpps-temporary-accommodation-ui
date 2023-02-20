import type { Extension, NewExtension } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class ExtensionService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createExtension(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    extension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedExtension = await bookingClient.extendBooking(premisesId, bookingId, extension)

    return confirmedExtension
  }
}
