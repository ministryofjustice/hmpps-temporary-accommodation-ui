import type { Extension, NewExtension } from '@approved-premises/api'
import type { RestClientBuilder, BookingClient } from '../data'

export default class ExtensionService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createExtension(
    token: string,
    premisesId: string,
    bookingId: string,
    extension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedExtension = await bookingClient.extendBooking(premisesId, bookingId, extension)

    return confirmedExtension
  }
}
