import type { ReferenceData } from '@approved-premises/ui'
import type { Cancellation, NewCancellation } from '@approved-premises/api'
import type { BookingClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export type CancellationReferenceData = {
  cancellationReasons: Array<ReferenceData>
}

export default class CancellationService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createCancellation(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    cancellation: NewCancellation,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedCancellation = await bookingClient.cancel(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getReferenceData(callConfig: CallConfig): Promise<CancellationReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const cancellationReasons = (await referenceDataClient.getReferenceData('cancellation-reasons')).sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    return { cancellationReasons }
  }
}
