import type { ApplicationSummary, Application } from 'approved-premises'

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

  async update(application: Application, applicationId: string): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: applicationId }),
      data: { data: application },
    })) as Application
  }

  async all(): Promise<ApplicationSummary[]> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as ApplicationSummary[]
  }
}
