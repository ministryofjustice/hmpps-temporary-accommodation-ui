import { Response } from 'express'
import type { Cas3ReportType, ProbationRegion } from '@approved-premises/api'
import type { ReferenceDataClient, RestClientBuilder } from '../data'
import ReportClient from '../data/reportClient'
import { CallConfig } from '../data/restClient'
import { reportForProbationRegionFilename } from '../utils/reportUtils'

export type ReportReferenceData = {
  probationRegions: Array<ProbationRegion>
}

export default class ReportService {
  constructor(
    private readonly reportClientFactory: RestClientBuilder<ReportClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async pipeReportForProbationRegion(
    callConfig: CallConfig,
    response: Response,
    probationRegionId: string,
    startDate: string,
    endDate: string,
    type: Cas3ReportType,
  ): Promise<void> {
    const reportClient = this.reportClientFactory(callConfig)

    const probationRegionName =
      probationRegionId === 'all'
        ? 'All regions'
        : (await this.getReferenceData(callConfig)).probationRegions.find(region => region.id === probationRegionId)
            .name

    const filename = reportForProbationRegionFilename(probationRegionName, startDate, endDate, type)

    const queryRegionId = probationRegionId === 'all' ? '' : probationRegionId

    await reportClient.reportForProbationRegion(response, filename, queryRegionId, startDate, endDate, type)
  }

  async getReferenceData(callConfig: CallConfig): Promise<ReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}
