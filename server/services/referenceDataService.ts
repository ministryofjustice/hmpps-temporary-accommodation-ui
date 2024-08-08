import { LocalAuthorityArea, ProbationDeliveryUnit } from '@approved-premises/api'
import { GetPdusOptions } from '@approved-premises/ui'
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

  async getPdus(callConfig: CallConfig, options: GetPdusOptions = {}) {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return (
      await referenceDataClient.getReferenceData<ProbationDeliveryUnit>('probation-delivery-units', {
        probationRegionId: options.regional ? callConfig.probationRegion.id : undefined,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))
  }
}
