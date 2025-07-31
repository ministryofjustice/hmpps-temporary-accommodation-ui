import {
  Cas3NewPremises,
  Cas3Premises,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
  Cas3UpdatePremises,
} from '@approved-premises/api'
import RestClient, { CallConfig } from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClientV2', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(postcodeOrAddress: string, premisesStatus: Cas3PremisesStatus, sortBy: Cas3PremisesSortBy) {
    return this.restClient.get<Cas3PremisesSearchResults>({
      path: paths.cas3.premises.search({}),
      query: { postcodeOrAddress, premisesStatus, sortBy },
    })
  }

  async find(premisesId: string) {
    return this.restClient.get<Cas3Premises>({
      path: paths.cas3.premises.show({ premisesId }),
    })
  }

  async create(data: Cas3NewPremises) {
    return this.restClient.post<Cas3Premises>({ path: paths.cas3.premises.create({}), data })
  }

  async update(premisesId: string, data: Cas3UpdatePremises) {
    return this.restClient.put<Cas3Premises>({ path: paths.cas3.premises.update({ premisesId }), data })
  }
}
