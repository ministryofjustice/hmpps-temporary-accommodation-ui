import type { ReferenceData } from '@approved-premises/ui'
import type { LostBed, NewLostBed } from '@approved-premises/api'
import { Request } from 'express'
import type { RestClientBuilder, LostBedClient, ReferenceDataClient } from '../data'

export type LostBedReferenceData = Array<ReferenceData>
export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createLostBed(req: Request, premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(req)

    const confirmedLostBed = await lostBedClient.create(premisesId, lostBed)

    return confirmedLostBed
  }

  async getReferenceData(req: Request): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(req)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
