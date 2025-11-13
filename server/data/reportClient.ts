import { Response } from 'express'
import { Cas3ReportType } from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient, { CallConfig } from './restClient'
import { getApiReportPath } from '../utils/reportUtils'

export default class ReportClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async reportForProbationRegion(
    response: Response,
    filename: string,
    probationRegionId: string,
    startDate: string,
    endDate: string,
    type: Cas3ReportType,
  ): Promise<void> {
    await this.restClient.pipe(response, {
      path: getApiReportPath(type),
      query: { probationRegionId, startDate, endDate },
      filename,
    })
  }
}
