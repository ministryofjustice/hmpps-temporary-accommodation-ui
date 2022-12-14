import type { ReferenceData } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReferenceData<T = ReferenceData>(objectType: string): Promise<Array<T>> {
    return (await this.restClient.get({ path: `/reference-data/${objectType}` })) as Array<T>
  }
}
