import crypto from 'crypto'

import type { ApplicationSummary } from 'approved-premises'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  /* istanbul ignore next */
  async create(_crn: string): Promise<string> {
    return crypto.randomUUID()
  }

  async all(): Promise<ApplicationSummary[]> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as ApplicationSummary[]
  }
}
