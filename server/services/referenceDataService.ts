import { LocalAuthorityArea } from '@approved-premises/api'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>) {}

  async getLocalAuthorities(callConfig: CallConfig) {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const localAuthorities = (
      (await referenceDataClient.getReferenceData('local-authority-areas')) as Array<LocalAuthorityArea>
    ).sort((a, b) => a.name.localeCompare(b.name))

    return localAuthorities
  }
}
