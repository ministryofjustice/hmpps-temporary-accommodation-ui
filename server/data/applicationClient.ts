import type { ActiveOffence, ApprovedPremisesApplication, Document } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async find(applicationId: string): Promise<ApprovedPremisesApplication> {
    return (await this.restClient.get({
      path: paths.applications.show({ id: applicationId }),
    })) as ApprovedPremisesApplication
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<ApprovedPremisesApplication> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: `${paths.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn: crn.trim(), convictionId, deliusEventNumber, offenceId },
    })) as ApprovedPremisesApplication
  }

  async update(application: ApprovedPremisesApplication): Promise<ApprovedPremisesApplication> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: application.id }),
      data: { data: application.data },
    })) as ApprovedPremisesApplication
  }

  async all(): Promise<Array<ApprovedPremisesApplication>> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as Array<ApprovedPremisesApplication>
  }

  async submit(application: ApprovedPremisesApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: application.id }),
      data: { translatedDocument: application.document },
    })
  }

  async documents(application: ApprovedPremisesApplication): Promise<Array<Document>> {
    return (await this.restClient.get({
      path: paths.applications.documents({ id: application.id }),
    })) as Array<Document>
  }
}
