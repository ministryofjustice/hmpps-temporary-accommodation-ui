import {
  Cas3Bedspace,
  Cas3Bedspaces,
  Cas3NewBedspace,
  Cas3UpdateBedspace,
  Characteristic,
} from '@approved-premises/api'
import { CallConfig } from '../data/restClient'
import { RestClientBuilder } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import ReferenceDataClient from '../data/referenceDataClient'
import { filterCharacteristics } from '../utils/characteristicUtils'

export type BedspaceReferenceData = {
  characteristics: Array<Characteristic>
}

export default class BedspaceService {
  constructor(
    private readonly bedspaceClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getSingleBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.find(premisesId, bedspaceId)
  }

  async getBedspacesForPremises(callConfig: CallConfig, premisesId: string): Promise<Cas3Bedspaces> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)

    return bedspaceClient.get(premisesId)
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const characteristics = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'room',
    ).sort((a, b) => a.name.localeCompare(b.name))

    return { characteristics }
  }

  async createBedspace(
    callConfig: CallConfig,
    premisesId: string,
    newBedspace: Cas3NewBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.create(premisesId, newBedspace)
  }

  async updateBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    updatedBedspace: Cas3UpdateBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.update(premisesId, bedspaceId, updatedBedspace)
  }

  async archiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    endDate: string,
  ): Promise<void> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.archive(premisesId, bedspaceId, { endDate })
  }

  async unarchiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    restartDate: string,
  ): Promise<void> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.unarchive(premisesId, bedspaceId, { restartDate })
  }

  async cancelArchiveBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.cancelArchive(premisesId, bedspaceId)
  }

  async cancelUnarchiveBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.cancelUnarchive(premisesId, bedspaceId)
  }

  async canArchiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
  ): Promise<{ date?: string; entityId?: string; entityReference?: string }> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.canArchive(premisesId, bedspaceId)
  }
}
