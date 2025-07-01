import { Cas3Bedspace } from '@approved-premises/api'
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
}
