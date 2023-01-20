import type { ReferenceData } from '@approved-premises/ui'
import type { Cancellation, NewCancellation } from '@approved-premises/api'
import { Request } from 'express'
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
    req: Request,
    premisesId: string,
    bookingId: string,
    cancellation: NewCancellation,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(req)

    const confirmedCancellation = await bookingClient.cancel(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getCancellation(
    req: Request,
    premisesId: string,
    bookingId: string,
    cancellationId: string,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(req)

    const booking = await bookingClient.findCancellation(premisesId, bookingId, cancellationId)

    return booking
  }

  async getReferenceData(req: Request): Promise<CancellationReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(req)

    const cancellationReasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return { cancellationReasons }
  }
}
