import type { ProbationRegion } from '@approved-premises/api'
import { Response } from 'express'
import type { ReferenceDataClient, RestClientBuilder } from '../data'
import ReportClient from '../data/reportClient'
import { CallConfig } from '../data/restClient'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from '../utils/reportUtils'

export type BookingReportReferenceData = {
  probationRegions: Array<ProbationRegion>
}

export default class BookingReportService {
  constructor(
    private readonly reportClientFactory: RestClientBuilder<ReportClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async pipeBookings(callConfig: CallConfig, response: Response, month: string, year: string): Promise<void> {
    const reportClient = this.reportClientFactory(callConfig)

    const filename = bookingReportFilename()

    await reportClient.bookings(response, filename, month, year)
  }

  async pipeBookingsForProbationRegion(
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

    const filename = bookingReportForProbationRegionFilename(probationRegion, month, year)

    await reportClient.bookingsForProbationRegion(response, filename, probationRegionId, month, year)
  }

  async getReferenceData(callConfig: CallConfig): Promise<BookingReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}