import type { ReferenceData } from '@approved-premises/ui'
import type {
  TemporaryAccommodationLostBed as LostBed,
  NewTemporaryAccommodationLostBed as NewLostBed,
} from '@approved-premises/api'
import type { LostBedClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export type LostBedReferenceData = Array<ReferenceData>
export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createLostBed(callConfig: CallConfig, premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const confirmedLostBed = await lostBedClient.create(premisesId, lostBed)

    return confirmedLostBed
  }

  async getReferenceData(callConfig: CallConfig): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
