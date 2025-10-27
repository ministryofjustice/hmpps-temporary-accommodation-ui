import type {
  Cas3VoidBedspace,
  Cas3VoidBedspaceCancellation,
  Cas3VoidBedspaceReason,
  Cas3VoidBedspaceRequest,
} from '@approved-premises/api'
import type { LostBedClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import { lostBedToCas3VoidBedspace } from '../utils/lostBedUtils'

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

    return lostBedToCas3VoidBedspace(await lostBedClient.create(premisesId, bedspaceId, lostBed))
  }

  async find(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
  ): Promise<Cas3VoidBedspace> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return lostBedToCas3VoidBedspace(await lostBedClient.find(premisesId, bedspaceId, lostBedId))
  }

  async update(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
    lostBedUpdate: Cas3VoidBedspaceRequest,
  ): Promise<Cas3VoidBedspace> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    return lostBedToCas3VoidBedspace(await lostBedClient.update(premisesId, bedspaceId, lostBedId, lostBedUpdate))
  }

  async getUpdateLostBed(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    lostBedId: string,
  ): Promise<Cas3VoidBedspaceRequest> {
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const lostBed = lostBedToCas3VoidBedspace(await lostBedClient.find(premisesId, bedspaceId, lostBedId))

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

  async getReferenceData(callConfig: CallConfig): Promise<Array<Cas3VoidBedspaceReason>> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return (await referenceDataClient.getReferenceData('lost-bed-reasons')).sort((a, b) => a.name.localeCompare(b.name))
  }
}
