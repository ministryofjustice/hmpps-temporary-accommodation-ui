import type {
  ActiveOffence,
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationApplicationSummary as ApplicationSummary,
  Document,
  SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

export default class ApplicationClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async find(applicationId: string): Promise<Application> {
    return (await this.restClient.get({
      path: paths.applications.show({ id: applicationId }),
    })) as Application
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: `${paths.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn: crn.trim(), convictionId, deliusEventNumber, offenceId },
    })) as Application
  }

  async update(applicationId: string, updateData: UpdateApplication): Promise<UpdateApplication> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: applicationId }),
      data: updateData,
    })) as UpdateApplication
  }

  async all(): Promise<Array<ApplicationSummary>> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as Array<ApplicationSummary>
  }

  async submit(applicationId: string, submissionData: SubmitApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: applicationId }),
      data: submissionData,
    })
  }

  async documents(application: Application): Promise<Array<Document>> {
    return (await this.restClient.get({
      path: paths.applications.documents({ id: application.id }),
    })) as Array<Document>
  }
}
