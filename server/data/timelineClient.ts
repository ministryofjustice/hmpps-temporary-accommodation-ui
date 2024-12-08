import type { ReferralHistoryNote, TemporaryAccommodationApplication } from '@approved-premises/api'
import config, { ApiConfig } from '../config'

import RestClient, { CallConfig } from './restClient'
import paths from '../paths/api'

export default class TimelineClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('timelineClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async fetch(assessmentId: TemporaryAccommodationApplication['assessmentId']): Promise<Array<ReferralHistoryNote>> {
    return this.restClient.get({
      path: paths.assessments.timeline({ assessmentId }),
    })
  }
}
