import type { Application } from '@approved-premises/api'
import { Request } from 'express'
import { ApplicationSummary } from '../testutils/factories/applicationSummary'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(req: Request) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, req)
  }

  async find(applicationId: string): Promise<Application> {
    return (await this.restClient.get({ path: paths.applications.show({ id: applicationId }) })) as Application
  }

  async create(crn: string): Promise<Application> {
    return (await this.restClient.post({ path: paths.applications.new.pattern, data: { crn } })) as Application
  }

  async update(application: Application): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: application.id }),
      data: { data: application.data },
    })) as Application
  }

  async all(): Promise<ApplicationSummary[]> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as ApplicationSummary[]
  }
}
