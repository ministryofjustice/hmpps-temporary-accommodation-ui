import type { Cas3Confirmation, NewConfirmation } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class ConfirmationService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createConfirmation(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    confirmation: NewConfirmation,
  ): Promise<Cas3Confirmation> {
    const bookingClient = this.bookingClientFactory(callConfig)

    return bookingClient.markAsConfirmed(premisesId, bookingId, confirmation)
  }
}
