import { Response } from 'express'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ReportClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig.token)
  }

  async bookings(response: Response, filename: string): Promise<void> {
    await this.restClient.pipe(response, filename, { path: paths.reports.bookings({}) })
  }

  async bookingsForProbationRegion(response: Response, filename: string, probationRegionId: string): Promise<void> {
    await this.restClient.pipe(response, filename, { path: paths.reports.bookings({}) }, { probationRegionId })
  }
}
