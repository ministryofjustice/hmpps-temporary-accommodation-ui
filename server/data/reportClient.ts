import { Response } from 'express'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

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

  async bookingsForProbationRegion(
    response: Response,
    filename: string,
    probationRegionId: string,
    month: string,
    year: string,
  ): Promise<void> {
    await this.restClient.pipe(response, {
      path: paths.reports.bookings({}),
      query: { probationRegionId, year, month },
      filename,
    })
  }
}
