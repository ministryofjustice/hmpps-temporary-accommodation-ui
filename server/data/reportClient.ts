import { Response } from 'express'
import { ReportType } from '@approved-premises/ui'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'
import { getApiReportPath } from '../utils/reportUtils'

export default class ReportClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async bookings(response: Response, filename: string, month: string, year: string): Promise<void> {
    await this.restClient.pipe(response, {
      path: paths.reports.bookings({}),
      query: { year, month },
      filename,
    })
  }

  async reportForProbationRegion(
    response: Response,
    filename: string,
    probationRegionId: string,
    month: string,
    year: string,
    type: ReportType,
  ): Promise<void> {
    await this.restClient.pipe(response, {
      path: getApiReportPath(type),
      query: { probationRegionId, year, month },
      filename,
    })
  }
}
