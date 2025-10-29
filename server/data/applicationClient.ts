import type {
  ActiveOffence,
  TemporaryAccommodationApplication as Application,
  Cas3ApplicationSummary as ApplicationSummary,
  Cas3Application,
  Cas3UpdateApplication,
  Cas3SubmitApplication as SubmitApplication,
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
      path: paths.cas3.applications.show({ id: applicationId }),
    })
  }

  async create(crn: string, activeOffence: ActiveOffence) {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return this.restClient.post<Application>({
      path: `${paths.cas3.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn: crn.trim(), convictionId, deliusEventNumber, offenceId },
    })
  }

  async delete(applicationId: string) {
    return this.restClient.delete<Application>({
      path: paths.cas3.applications.delete({ id: applicationId }),
    })
  }

  async update(applicationId: string, updateData: Cas3UpdateApplication) {
    return this.restClient.put<Cas3Application>({
      path: paths.cas3.applications.update({ id: applicationId }),
      data: updateData,
    })
  }

  async all() {
    return this.restClient.get<Array<ApplicationSummary>>({ path: paths.cas3.applications.index.pattern })
  }

  async submit(applicationId: string, submissionData: SubmitApplication) {
    return this.restClient.post<void>({
      path: paths.cas3.applications.submission({ id: applicationId }),
      data: submissionData,
    })
  }
}
