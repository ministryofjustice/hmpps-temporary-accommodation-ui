import { Cas3PremisesSearchResults, Cas3PremisesStatus } from '@approved-premises/api'
import RestClient, { CallConfig } from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClientV2', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(postcodeOrAddress: string, premisesStatus: Cas3PremisesStatus) {
    return this.restClient.get<Cas3PremisesSearchResults>({
      path: paths.v2.premises.index({}),
      query: { postcodeOrAddress, premisesStatus },
    })
  }
}
