import { LocalAuthorityArea, ProbationDeliveryUnit } from '@approved-premises/api'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>) {}

  async getLocalAuthorities(callConfig: CallConfig) {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return (await referenceDataClient.getReferenceData<LocalAuthorityArea>('local-authority-areas')).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }

  async getRegionPdus(callConfig: CallConfig) {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return (
      await referenceDataClient.getReferenceData<ProbationDeliveryUnit>('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))
  }
}
