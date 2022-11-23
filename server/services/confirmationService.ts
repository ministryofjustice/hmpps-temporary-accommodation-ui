import type { Confirmation, NewConfirmation } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'

export default class ConfirmationService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createConfirmation(
    token: string,
    premisesId: string,
    bookingId: string,
    confirmation: NewConfirmation,
  ): Promise<Confirmation> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.markAsConfirmed(premisesId, bookingId, confirmation)
  }
}
