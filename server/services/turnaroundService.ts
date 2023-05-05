import type { NewTurnaround, Turnaround } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class TurnaroundService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createTurnaround(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    turnaround: NewTurnaround,
  ): Promise<Turnaround> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedTurnaround = await bookingClient.createTurnaround(premisesId, bookingId, turnaround)

    return confirmedTurnaround
  }
}
