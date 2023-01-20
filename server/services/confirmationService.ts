import type { Confirmation, NewConfirmation } from '@approved-premises/api'
import { Request } from 'express'
import type { BookingClient, RestClientBuilder } from '../data'

export default class ConfirmationService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createConfirmation(
    req: Request,
    premisesId: string,
    bookingId: string,
    confirmation: NewConfirmation,
  ): Promise<Confirmation> {
    const bookingClient = this.bookingClientFactory(req)

    return bookingClient.markAsConfirmed(premisesId, bookingId, confirmation)
  }
}
