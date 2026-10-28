import {
  Cas3ArchivePremises,
  Cas3NewPremises,
  Cas3Premises,
  Cas3PremisesBedspaceTotals,
  Cas3PremisesSearchResults,
  Cas3PremisesStatus,
  Cas3ReferenceData,
  Cas3UnarchivePremises,
  Cas3UpdatePremises,
  LocalAuthorityArea,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import { PremisesClient, ReferenceDataClient, RestClientBuilder } from '../data'

import { CallConfig } from '../data/restClient'

export type Cas3PremisesReferenceData = {
  localAuthorities: Array<LocalAuthorityArea>
  characteristics: Array<Cas3ReferenceData>
  probationRegions: Array<ProbationRegion>
  pdus: Array<ProbationDeliveryUnit>
}

export default class PremisesService {
  constructor(
    protected readonly premisesClientFactory: RestClientBuilder<PremisesClient>,
    protected readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async search(
    callConfig: CallConfig,
    postcodeOrAddress?: string,
    status: Cas3PremisesStatus = 'online',
  ): Promise<Cas3PremisesSearchResults> {
    const premisesClient = this.premisesClientFactory(callConfig)

    return premisesClient.search(postcodeOrAddress ?? '', status)
  }

  async getSinglePremises(callConfig: CallConfig, premisesId: string): Promise<Cas3Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.find(premisesId)
  }

  async getSinglePremisesBedspaceTotals(
    callConfig: CallConfig,
    premisesId: string,
  ): Promise<Cas3PremisesBedspaceTotals> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.totals(premisesId)
  }

  async getCharacteristics(callConfig: CallConfig): Promise<Array<Cas3ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return referenceDataClient.getCas3ReferenceData('PREMISES_CHARACTERISTICS')
  }

  async getReferenceData(callConfig: CallConfig): Promise<Cas3PremisesReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const [unsortedLocalAuthorities, unsortedCharacteristics, unsortedProbationRegions, unsortedPdus] =
      await Promise.all([
        referenceDataClient.getReferenceData<LocalAuthorityArea>('local-authority-areas'),
        this.getCharacteristics(callConfig),
        referenceDataClient.getReferenceData<ProbationRegion>('probation-regions'),
        referenceDataClient.getReferenceData<ProbationDeliveryUnit>('probation-delivery-units', {
          probationRegionId: callConfig.probationRegion.id,
        }),
      ])

    const localAuthorities = unsortedLocalAuthorities.sort((a, b) => a.name.localeCompare(b.name))

    const characteristics = unsortedCharacteristics.sort((a, b) => a.description.localeCompare(b.description))

    const probationRegions = unsortedProbationRegions.sort((a, b) => a.name.localeCompare(b.name))

    const pdus = unsortedPdus.sort((a, b) => a.name.localeCompare(b.name))

    return { localAuthorities, characteristics, probationRegions, pdus }
  }

  async createPremises(callConfig: CallConfig, newPremises: Cas3NewPremises): Promise<Cas3Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.create(newPremises)
  }

  async updatePremises(callConfig: CallConfig, premisesId: string, updatedPremises: Cas3UpdatePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.update(premisesId, updatedPremises)
  }

  async canArchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.canArchive(premisesId)
  }

  async archivePremises(callConfig: CallConfig, premisesId: string, archivePayload: Cas3ArchivePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.archive(premisesId, archivePayload)
  }

  async unarchivePremises(callConfig: CallConfig, premisesId: string, unarchivePayload: Cas3UnarchivePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.unarchive(premisesId, unarchivePayload)
  }

  async cancelArchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.cancelArchive(premisesId)
  }

  async cancelUnarchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.cancelUnarchive(premisesId)
  }
}
