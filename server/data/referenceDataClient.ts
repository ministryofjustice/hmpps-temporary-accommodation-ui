import type { ReferenceData } from '@approved-premises/ui'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getReferenceData<T = ReferenceData>(objectType: string): Promise<Array<T>> {
    return (await this.restClient.get({ path: `/reference-data/${objectType}` })) as Array<T>
  }
}
