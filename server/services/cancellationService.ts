import type { Cancellation, CancellationDto, ReferenceData } from 'approved-premises'
import type { RestClientBuilder, CancellationClient, ReferenceDataClient } from '../data'
import Service from './service'

export default class CancellationService extends Service {
  constructor(
    private readonly cancellationClientFactory: RestClientBuilder<CancellationClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {
    super()
  }

  async createCancellation(
    premisesId: string,
    bookingId: string,
    cancellation: CancellationDto,
  ): Promise<Cancellation> {
    const cancellationClient = this.cancellationClientFactory(this.token)

    const confirmedCancellation = await cancellationClient.create(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getCancellation(premisesId: string, bookingId: string, cancellationId: string): Promise<Cancellation> {
    const cancellationClient = this.cancellationClientFactory(this.token)

    const booking = await cancellationClient.get(premisesId, bookingId, cancellationId)

    return booking
  }

  async getCancellationReasons(): Promise<Array<ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(this.token)

    const reasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return reasons as Array<ReferenceData>
  }
}
