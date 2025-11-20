import type { Cas3VoidBedspace, Cas3VoidBedspaceCancellation, Cas3VoidBedspaceRequest } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, bedspaceId: string, lostBed: Cas3VoidBedspaceRequest) {
    return this.restClient.post<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.create({ premisesId, bedspaceId }),
      data: lostBed,
    })
  }

  async find(premisesId: string, bedspaceId: string, voidBedspaceId: string) {
    return this.restClient.get<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.show({ premisesId, bedspaceId, voidBedspaceId }),
    })
  }

  async update(premisesId: string, bedspaceId: string, lostBedId: string, data: Cas3VoidBedspaceRequest) {
    return this.restClient.put<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.update({ premisesId, bedspaceId, voidBedspaceId: lostBedId }),
      data,
    })
  }

  async allLostBedsForPremisesId(premisesId: string) {
    return this.restClient.get<Array<Cas3VoidBedspace>>({
      path: paths.cas3.premises.voidBedspaces.index({ premisesId }),
    })
  }

  async cancel(premisesId: string, bedspaceId: string, lostBedId: string, data: Cas3VoidBedspaceCancellation) {
    return this.restClient.put<Cas3VoidBedspaceCancellation>({
      path: paths.cas3.premises.voidBedspaces.cancel({ premisesId, bedspaceId, voidBedspaceId: lostBedId }),
      data,
    })
  }
}
