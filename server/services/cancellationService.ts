import type { ReferenceData } from '@approved-premises/ui'
import type { Cancellation, NewCancellation } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder, ReferenceDataClient } from '../data'

export type CancellationReferenceData = {
  cancellationReasons: Array<ReferenceData>
}

export default class CancellationService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellation: NewCancellation,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedCancellation = await bookingClient.cancel(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellationId: string,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.findCancellation(premisesId, bookingId, cancellationId)

    return booking
  }

  async getReferenceData(token: string): Promise<CancellationReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const cancellationReasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return { cancellationReasons }
  }
}
