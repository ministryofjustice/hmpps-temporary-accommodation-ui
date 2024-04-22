import { Response } from 'express'
import type { ProbationRegion } from '@approved-premises/api'
import type { ReportType } from '@approved-premises/ui'
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
    type: ReportType,
  ): Promise<void> {
    const reportClient = this.reportClientFactory(callConfig)

    const probationRegionName =
      probationRegionId === 'all'
        ? 'All regions'
        : (await this.getReferenceData(callConfig)).probationRegions.find(region => region.id === probationRegionId)
            .name

    const filename = reportForProbationRegionFilename(probationRegionName, month, year, type)

    const queryRegionId = probationRegionId === 'all' ? '' : probationRegionId

    await reportClient.reportForProbationRegion(response, filename, queryRegionId, month, year, type)
  }

  async getReferenceData(callConfig: CallConfig): Promise<ReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}
