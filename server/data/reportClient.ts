import { Request, Response } from 'express'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ReportClient {
  restClient: RestClient

  constructor(req: Request) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, req)
  }

  async bookings(response: Response, filename: string): Promise<void> {
    await this.restClient.pipe(response, filename, { path: paths.reports.bookings({}) })
  }

  async bookingsForProbationRegion(response: Response, filename: string, probationRegionId: string): Promise<void> {
    await this.restClient.pipe(response, filename, { path: paths.reports.bookings({}) }, { probationRegionId })
  }
}
