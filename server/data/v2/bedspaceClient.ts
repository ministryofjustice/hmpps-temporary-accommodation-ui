import { Cas3Bedspace, Cas3Bedspaces, Cas3NewBedspace } from '@approved-premises/api'
import RestClient, { CallConfig } from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/api'

export default class BedspaceClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bedspaceClientV2', config.apis.approvedPremises as ApiConfig, callConfig)
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

  async archive(premisesId: string, bedspaceId: string, data: { endDate: string }) {
    return this.restClient.post<void>({
      path: paths.cas3.premises.bedspaces.archive({ premisesId, bedspaceId }),
      data,
    })
  }
}
