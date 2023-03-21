import type {
  LostBed,
  LostBedCancellation,
  NewLostBed,
  NewLostBedCancellation,
  UpdateLostBed,
} from '@approved-premises/api'
import type { ReferenceData } from '@approved-premises/ui'
import type { LostBedClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export type LostBedReferenceData = Array<ReferenceData>
export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async create(callConfig: CallConfig, premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const confirmedLostBed = await lostBedClient.create(premisesId, lostBed)

    return confirmedLostBed
  }

  async find(callConfig: CallConfig, premisesID: string, lostBedId: string): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const lostBed = await lostBedClient.find(premisesID, lostBedId)

    return lostBed
  }

  async update(
    callConfig: CallConfig,
    premisesId: string,
    lostBedId: string,
    lostBedUpdate: UpdateLostBed,
  ): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const updatedLostBed = await lostBedClient.update(premisesId, lostBedId, lostBedUpdate)

    return updatedLostBed
  }

  async getUpdateLostBed(callConfig: CallConfig, premisesId: string, lostBedId: string): Promise<UpdateLostBed> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const lostBed = await lostBedClient.find(premisesId, lostBedId)

    return {
      ...lostBed,
      reason: lostBed.reason.id,
    }
  }

  async cancel(
    callConfig: CallConfig,
    premisesId: string,
    lostBedId: string,
    newLostBedCancellation: NewLostBedCancellation,
  ): Promise<LostBedCancellation> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const lostBedCancellation = await lostBedClient.cancel(premisesId, lostBedId, newLostBedCancellation)

    return lostBedCancellation
  }

  async getReferenceData(callConfig: CallConfig): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
