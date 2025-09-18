import type {
  Characteristic,
  LocalAuthorityArea,
  TemporaryAccommodationPremises as Premises,
} from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import type { PremisesClient, ReferenceDataClient, RestClientBuilder } from '../data'

import { CallConfig } from '../data/restClient'
import { filterCharacteristics } from '../utils/characteristicUtils'

export type PremisesReferenceData = {
  localAuthorities: Array<LocalAuthorityArea>
  characteristics: Array<Characteristic>
  probationRegions: Array<ReferenceData>
  pdus: Array<ReferenceData>
}

export default class PremisesService {
  constructor(
    private readonly premisesClientFactory: RestClientBuilder<PremisesClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getReferenceData(callConfig: CallConfig): Promise<PremisesReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const localAuthorities = (
      (await referenceDataClient.getReferenceData('local-authority-areas')) as Array<LocalAuthorityArea>
    ).sort((a, b) => a.name.localeCompare(b.name))

    const characteristics = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'premises',
    ).sort((a, b) => a.name.localeCompare(b.name))

    const probationRegions = (await referenceDataClient.getReferenceData('probation-regions')).sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    const pdus = (
      await referenceDataClient.getReferenceData('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))

    return { localAuthorities, characteristics, probationRegions, pdus }
  }

  async getPremises(callConfig: CallConfig, id: string): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.find(id)
  }
}
