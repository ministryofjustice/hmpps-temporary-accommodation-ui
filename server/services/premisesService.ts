import type { TemporaryAccommodationPremises as Premises } from '@approved-premises/api'
import type { PremisesClient, RestClientBuilder } from '../data'

import { CallConfig } from '../data/restClient'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getPremises(callConfig: CallConfig, id: string): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.find(id)
  }
}
