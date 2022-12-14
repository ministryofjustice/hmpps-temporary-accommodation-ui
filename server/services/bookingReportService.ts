import type { ProbationRegion } from '@approved-premises/api'
import { Response } from 'express'
import type { RestClientBuilder, ReferenceDataClient } from '../data'
import ReportClient from '../data/reportClient'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from '../utils/reportUtils'

export type BookingReportReferenceData = {
  probationRegions: Array<ProbationRegion>
}

export default class BookingReportService {
  constructor(
    private readonly reportClientFactory: RestClientBuilder<ReportClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async pipeBookings(token: string, response: Response): Promise<void> {
    const reportClient = this.reportClientFactory(token)

    const filename = bookingReportFilename()

    await reportClient.bookings(response, filename)
  }

  async pipeBookingsForProbationRegion(token: string, response: Response, probationRegionId: string): Promise<void> {
    const reportClient = this.reportClientFactory(token)

    const probationRegion = (await this.getReferenceData(token)).probationRegions.find(
      region => region.id === probationRegionId,
    )

    const filename = bookingReportForProbationRegionFilename(probationRegion)

    await reportClient.bookingsForProbationRegion(response, filename, probationRegionId)
  }

  async getReferenceData(token: string): Promise<BookingReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}
