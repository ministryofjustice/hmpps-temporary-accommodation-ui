import type {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

export default class AssessmentClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('assessmentClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all(): Promise<Array<AssessmentSummary>> {
    return (await this.restClient.get({ path: paths.assessments.index.pattern })) as Array<AssessmentSummary>
  }

  async find(assessmentId: string): Promise<Assessment> {
    return (await this.restClient.get({ path: paths.assessments.show({ id: assessmentId }) })) as Assessment
  }
}
