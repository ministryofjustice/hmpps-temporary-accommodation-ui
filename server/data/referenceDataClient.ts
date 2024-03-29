import type { ReferenceData } from '@approved-premises/ui'
import config, { ApiConfig } from '../config'
import RestClient, { CallConfig } from './restClient'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getReferenceData<T = ReferenceData>(objectType: string, query?: Record<string, string>): Promise<Array<T>> {
    return (await this.restClient.get({ path: `/reference-data/${objectType}`, query })) as Array<T>
  }
}
