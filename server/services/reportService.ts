import type { ProbationRegion } from '@approved-premises/api'
import { Response } from 'express'
import type { ReferenceDataClient, RestClientBuilder } from '../data'
import ReportClient from '../data/reportClient'
import { CallConfig } from '../data/restClient'
import { reportFilename, reportForProbationRegionFilename } from '../utils/reportUtils'

export type ReportReferenceData = {
  probationRegions: Array<ProbationRegion>
}

export default class ReportService {
  constructor(
    private readonly reportClientFactory: RestClientBuilder<ReportClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async pipeBookings(callConfig: CallConfig, response: Response, month: string, year: string): Promise<void> {
    const reportClient = this.reportClientFactory(callConfig)

    const filename = reportFilename()

    await reportClient.bookings(response, filename, month, year)
  }

  async pipeReportForProbationRegion(
    callConfig: CallConfig,
    response: Response,
    probationRegionId: string,
    month: string,
    year: string,
  ): Promise<void> {
    const reportClient = this.reportClientFactory(callConfig)

    const probationRegion = (await this.getReferenceData(callConfig)).probationRegions.find(
      region => region.id === probationRegionId,
    )

    const filename = reportForProbationRegionFilename(probationRegion, month, year)

    await reportClient.reportForProbationRegion(response, filename, probationRegionId, month, year, type)
  }

  async getReferenceData(callConfig: CallConfig): Promise<ReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}
