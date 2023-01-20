import type { ProbationRegion } from '@approved-premises/api'
import { Request, Response } from 'express'
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

  async pipeBookings(req: Request, response: Response): Promise<void> {
    const reportClient = this.reportClientFactory(req)

    const filename = bookingReportFilename()

    await reportClient.bookings(response, filename)
  }

  async pipeBookingsForProbationRegion(req: Request, response: Response, probationRegionId: string): Promise<void> {
    const reportClient = this.reportClientFactory(req)

    const probationRegion = (await this.getReferenceData(req)).probationRegions.find(
      region => region.id === probationRegionId,
    )

    const filename = bookingReportForProbationRegionFilename(probationRegion)

    await reportClient.bookingsForProbationRegion(response, filename, probationRegionId)
  }

  async getReferenceData(req: Request): Promise<BookingReportReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(req)

    const probationRegions = await referenceDataClient.getReferenceData('probation-regions')

    return { probationRegions }
  }
}
