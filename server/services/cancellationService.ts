import type { Cancellation, CancellationDto, ReferenceData } from 'approved-premises'
import type { RestClientBuilder, CancellationClient, ReferenceDataClient } from '../data'

export default class CancellationService {
  constructor(
    private readonly cancellationClientFactory: RestClientBuilder<CancellationClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellation: CancellationDto,
  ): Promise<Cancellation> {
    const cancellationClient = this.cancellationClientFactory(token)

    const confirmedCancellation = await cancellationClient.create(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellationId: string,
  ): Promise<Cancellation> {
    const cancellationClient = this.cancellationClientFactory(token)

    const booking = await cancellationClient.get(premisesId, bookingId, cancellationId)

    return booking
  }

  async getCancellationReasons(token: string): Promise<Array<ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return reasons as Array<ReferenceData>
  }
}
