import type {
  TemporaryAccommodationBedSearchParameters as BedSearchParameters,
  BedSearchResults,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

export default class BedspaceClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bedClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(searchParameters: BedSearchParameters) {
    return this.restClient.post<BedSearchResults>({
      path: paths.bedspaces.search({}),
      data: searchParameters,
    })
  }
}
