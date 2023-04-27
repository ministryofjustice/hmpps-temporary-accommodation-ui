import type { Turnaround, UpdateTurnaround } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class TurnaroundService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async updateTurnaround(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    turnaround: UpdateTurnaround,
  ): Promise<Turnaround> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const updatedTurnaround = await bookingClient.updateTurnaround(premisesId, bookingId, turnaround)

    return updatedTurnaround
  }
}
