import {
  Cas3Bedspace,
  Cas3Bedspaces,
  Cas3NewBedspace,
  Cas3ReferenceData,
  Cas3UpdateBedspace,
  Characteristic,
} from '@approved-premises/api'
import { CallConfig } from '../data/restClient'
import { RestClientBuilder } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import ReferenceDataClient from '../data/referenceDataClient'
import { characteristicToCas3ReferenceData, filterCharacteristics } from '../utils/characteristicUtils'
import { populateBedspaceCharacteristics } from '../utils/bedspaceUtils'
import config from '../config'

export type BedspaceReferenceData = {
  characteristics: Array<Cas3ReferenceData>
}

export default class BedspaceService {
  constructor(
    private readonly bedspaceClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getSingleBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return populateBedspaceCharacteristics(await bedspaceClient.find(premisesId, bedspaceId))
  }

  async getBedspacesForPremises(callConfig: CallConfig, premisesId: string): Promise<Cas3Bedspaces> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)

    const response = await bedspaceClient.get(premisesId)

    return {
      ...response,
      bedspaces: response.bedspaces.map(bedspace => populateBedspaceCharacteristics(bedspace)),
    }
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    if (!config.flags.enableCas3v2Api) {
      return {
        characteristics: filterCharacteristics(
          await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
          'room',
        )
          .map(characteristicToCas3ReferenceData)
          .sort((a, b) => a.description.localeCompare(b.description)),
      }
    }

    return {
      characteristics: (await referenceDataClient.getCas3ReferenceData('BEDSPACE_CHARACTERISTICS')).sort((a, b) =>
        a.description.localeCompare(b.description),
      ),
    }
  }

  async createBedspace(
    callConfig: CallConfig,
    premisesId: string,
    newBedspace: Cas3NewBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return populateBedspaceCharacteristics(await bedspaceClient.create(premisesId, newBedspace))
  }

  async updateBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    updatedBedspace: Cas3UpdateBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return populateBedspaceCharacteristics(await bedspaceClient.update(premisesId, bedspaceId, updatedBedspace))
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
    return populateBedspaceCharacteristics(await bedspaceClient.cancelArchive(premisesId, bedspaceId))
  }

  async cancelUnarchiveBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return populateBedspaceCharacteristics(await bedspaceClient.cancelUnarchive(premisesId, bedspaceId))
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
