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
  Characteristic,
  LocalAuthorityArea,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import { PremisesClient, ReferenceDataClient, RestClientBuilder } from '../data'

import { CallConfig } from '../data/restClient'
import { characteristicToCas3ReferenceData, filterCharacteristics } from '../utils/characteristicUtils'
import { populatePremisesCharacteristics } from '../utils/premisesUtils'
import config from '../config'

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
    return populatePremisesCharacteristics(await premisesClient.find(premisesId))
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

    if (!config.flags.enableCas3v2Api) {
      return filterCharacteristics(
        await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
        'premises',
      ).map(characteristicToCas3ReferenceData)
    }

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
    return populatePremisesCharacteristics(await premisesClient.create(newPremises))
  }

  async updatePremises(callConfig: CallConfig, premisesId: string, updatedPremises: Cas3UpdatePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return populatePremisesCharacteristics(await premisesClient.update(premisesId, updatedPremises))
  }

  async canArchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.canArchive(premisesId)
  }

  async archivePremises(callConfig: CallConfig, premisesId: string, archivePayload: Cas3ArchivePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return populatePremisesCharacteristics(await premisesClient.archive(premisesId, archivePayload))
  }

  async unarchivePremises(callConfig: CallConfig, premisesId: string, unarchivePayload: Cas3UnarchivePremises) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return populatePremisesCharacteristics(await premisesClient.unarchive(premisesId, unarchivePayload))
  }

  async cancelArchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return populatePremisesCharacteristics(await premisesClient.cancelArchive(premisesId))
  }

  async cancelUnarchivePremises(callConfig: CallConfig, premisesId: string) {
    const premisesClient = this.premisesClientFactory(callConfig)
    return populatePremisesCharacteristics(await premisesClient.cancelUnarchive(premisesId))
  }
}
