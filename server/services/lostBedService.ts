import type {
  Cas3ReferenceData,
  Cas3VoidBedspace,
  Cas3VoidBedspaceCancellation,
  Cas3VoidBedspaceRequest,
} from '@approved-premises/api'
import type { LostBedClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async create(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBed: Cas3VoidBedspaceRequest,
  ): Promise<Cas3VoidBedspace> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return lostBedClient.create(premisesId, bedspaceId, lostBed)
  }

  async find(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
  ): Promise<Cas3VoidBedspace> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return lostBedClient.find(premisesId, bedspaceId, lostBedId)
  }

  async update(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
    lostBedUpdate: Cas3VoidBedspaceRequest,
  ): Promise<Cas3VoidBedspace> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return lostBedClient.update(premisesId, bedspaceId, lostBedId, lostBedUpdate)
  }

  async getUpdateLostBed(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
  ): Promise<Cas3VoidBedspaceRequest> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const lostBed = await lostBedClient.find(premisesId, bedspaceId, lostBedId)

    return {
      ...lostBed,
      reasonId: lostBed.reason.id,
    }
  }

  async cancel(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
    newLostBedCancellation: Cas3VoidBedspaceCancellation,
  ): Promise<Cas3VoidBedspaceCancellation> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return (await lostBedClient.cancel(
      premisesId,
      bedspaceId,
      lostBedId,
      newLostBedCancellation,
    )) as Cas3VoidBedspaceCancellation
  }

  async getReferenceData(callConfig: CallConfig): Promise<Array<Cas3ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return (await referenceDataClient.getCas3ReferenceData('VOID_BEDSPACE_REASONS')).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }
}
