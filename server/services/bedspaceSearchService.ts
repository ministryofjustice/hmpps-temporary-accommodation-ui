import type { TemporaryAccommodationBedSearchParameters as BedSearchParameters } from '@approved-premises/api'
import { ReferenceData } from '../@types/ui'
import { RestClientBuilder } from '../data'
import BedClient from '../data/bedClient'
import pduJson from '../data/pdus.json'
import { CallConfig } from '../data/restClient'

export type BedspaceSearchReferenceData = {
  pdus: Array<ReferenceData>
}

export default class BedspaceSearchService {
  constructor(private readonly bedClientFactory: RestClientBuilder<BedClient>) {}

  async search(callConfig: CallConfig, searchParameters: BedSearchParameters) {
    const bedClient = this.bedClientFactory(callConfig)

    return bedClient.search({
      serviceName: 'temporary-accommodation',
      ...searchParameters,
    })
  }

  async getReferenceData(): Promise<BedspaceSearchReferenceData> {
    const pdus = pduJson.sort((a, b) => a.name.localeCompare(b.name))

    return { pdus }
  }
}
