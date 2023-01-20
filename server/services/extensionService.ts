import type { Extension, NewExtension } from '@approved-premises/api'
import { Request } from 'express'
import type { RestClientBuilder, BookingClient } from '../data'

export default class ExtensionService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createExtension(
    req: Request,
    premisesId: string,
    bookingId: string,
    extension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(req)

    const confirmedExtension = await bookingClient.extendBooking(premisesId, bookingId, extension)

    return confirmedExtension
  }
}
