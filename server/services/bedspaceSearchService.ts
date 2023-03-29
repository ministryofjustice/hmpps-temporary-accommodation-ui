import type { TemporaryAccommodationBedSearchParameters as BedSearchParameters } from '@approved-premises/api'
import { ReferenceData } from '../@types/ui'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import BedClient from '../data/bedClient'
import { CallConfig } from '../data/restClient'

export type BedspaceSearchReferenceData = {
  pdus: Array<ReferenceData>
}

export default class BedspaceSearchService {
  constructor(
    private readonly bedClientFactory: RestClientBuilder<BedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async search(callConfig: CallConfig, searchParameters: BedSearchParameters) {
    const bedClient = this.bedClientFactory(callConfig)

    return bedClient.search({
      serviceName: 'temporary-accommodation',
      ...searchParameters,
    })
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceSearchReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const pdus = (
      await referenceDataClient.getReferenceData('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))

    return { pdus }
  }
}
