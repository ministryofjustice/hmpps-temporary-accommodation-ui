import {
  Cas3Bedspace,
  Cas3BedspaceSearchParameters,
  Cas3BedspaceSearchResults,
  Cas3Bedspaces,
  Cas3NewBedspace,
  Cas3UpdateBedspace,
} from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class BedspaceClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bedspaceClientV2', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(searchParameters: Cas3BedspaceSearchParameters) {
    return this.restClient.post<Cas3BedspaceSearchResults>({
      path: paths.bedspaces.search({}),
      data: searchParameters,
    })
  }

  async find(premisesId: string, bedspaceId: string) {
    return this.restClient.get<Cas3Bedspace>({
      path: paths.cas3.premises.bedspaces.show({ premisesId, bedspaceId }),
    })
  }

  async create(premisesId: string, data: Cas3NewBedspace) {
    return this.restClient.post<Cas3Bedspace>({ path: paths.cas3.premises.bedspaces.create({ premisesId }), data })
  }

  async get(premisesId: string) {
    return this.restClient.get<Cas3Bedspaces>({
      path: paths.cas3.premises.bedspaces.get({ premisesId }),
    })
  }

  async update(premisesId: string, bedspaceId: string, data: Cas3UpdateBedspace) {
    return this.restClient.put<Cas3Bedspace>({
      path: paths.cas3.premises.bedspaces.update({ premisesId, bedspaceId }),
      data,
    })
  }

  async archive(premisesId: string, bedspaceId: string, data: { endDate: string }) {
    return this.restClient.post<void>({
      path: paths.cas3.premises.bedspaces.archive({ premisesId, bedspaceId }),
      data,
    })
  }

  async unarchive(premisesId: string, bedspaceId: string, data: { restartDate: string }) {
    return this.restClient.post<void>({
      path: paths.cas3.premises.bedspaces.unarchive({ premisesId, bedspaceId }),
      data,
    })
  }

  async cancelArchive(premisesId: string, bedspaceId: string) {
    return this.restClient.put<Cas3Bedspace>({
      path: paths.cas3.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }),
    })
  }

  async cancelUnarchive(premisesId: string, bedspaceId: string) {
    return this.restClient.put<Cas3Bedspace>({
      path: paths.cas3.premises.bedspaces.cancelUnarchive({ premisesId, bedspaceId }),
    })
  }

  async canArchive(premisesId: string, bedspaceId: string) {
    return this.restClient.get<{ date?: string; entityId?: string; entityReference?: string }>({
      path: paths.cas3.premises.bedspaces.canArchive({ premisesId, bedspaceId }),
    })
  }
}
