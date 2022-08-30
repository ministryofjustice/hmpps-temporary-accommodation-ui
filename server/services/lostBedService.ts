import type { LostBed, LostBedDto, ReferenceData } from 'approved-premises'
import type { RestClientBuilder, LostBedClient, ReferenceDataClient } from '../data'

export type LostBedReferenceData = Array<ReferenceData>
export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createLostBed(token: string, premisesId: string, lostBed: LostBedDto): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(token)

    const confirmedLostBed = await lostBedClient.create(premisesId, lostBed)

    return confirmedLostBed
  }

  async getReferenceData(token: string): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
