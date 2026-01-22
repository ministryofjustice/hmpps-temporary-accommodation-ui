import type { ReferenceData } from '@approved-premises/ui'
import { Cas3RefDataType, Cas3ReferenceData } from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient, { CallConfig } from './restClient'
import paths from '../paths/api'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getReferenceData<T = ReferenceData>(objectType: string, query?: Record<string, string>) {
    return this.restClient.get<Array<T>>({ path: paths.referenceData({ objectType }), query })
  }

  async getCas3ReferenceData(objectType: Cas3RefDataType) {
    return this.restClient.get<Array<Cas3ReferenceData>>({
      path: paths.cas3.referenceData({}),
      query: { type: objectType },
    })
  }
}
