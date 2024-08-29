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

  async find(applicationId: string) {
    return this.restClient.get<Application>({
      path: paths.applications.show({ id: applicationId }),
    })
  }

  async create(crn: string, activeOffence: ActiveOffence) {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return this.restClient.post<Application>({
      path: `${paths.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn: crn.trim(), convictionId, deliusEventNumber, offenceId },
    })
  }

  async update(applicationId: string, updateData: UpdateApplication) {
    return this.restClient.put<UpdateApplication>({
      path: paths.applications.update({ id: applicationId }),
      data: updateData,
    })
  }

  async all() {
    return this.restClient.get<Array<ApplicationSummary>>({ path: paths.applications.index.pattern })
  }

  async submit(applicationId: string, submissionData: SubmitApplication) {
    return this.restClient.post<void>({
      path: paths.applications.submission({ id: applicationId }),
      data: submissionData,
    })
  }

  async documents(application: Application) {
    return this.restClient.get<Array<Document>>({
      path: paths.applications.documents({ id: application.id }),
    })
  }
}
