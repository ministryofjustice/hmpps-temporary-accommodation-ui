import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import ReferenceDataClient from '../data/referenceDataClient'
import BookingReportService from './bookingReportService'
import { ReportClient } from '../data'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from '../utils/reportUtils'
import probationRegionFactory from '../testutils/factories/probationRegion'
import { CallConfig } from '../data/restClient'

jest.mock('../data/reportClient.ts')
jest.mock('../data/referenceDataClient.ts')
jest.mock('../utils/reportUtils')

describe('BookingReportService', () => {
  const reportClient = new ReportClient(null) as jest.Mocked<ReportClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const ReportClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const token = 'some-token'
  const callConfig = { token } as CallConfig

  const service = new BookingReportService(ReportClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    ReportClientFactory.mockReturnValue(reportClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('pipeBookings', () => {
    it('pipes all bookings to an express response, for download as a file', async () => {
      const response = createMock<Response>()
      ;(bookingReportFilename as jest.MockedFunction<typeof bookingReportFilename>).mockReturnValue('some-filename')

      await service.pipeBookings(callConfig, response)

      expect(ReportClientFactory).toHaveBeenCalledWith(token)
      expect(bookingReportFilename).toHaveBeenCalled()
      expect(reportClient.bookings).toHaveBeenCalledWith(response, 'some-filename')
    })
  })

  describe('pipeBookingsForProbationRegion', () => {
    it('pipes all bookings to an express response, for download as a file', async () => {
      const probationRegions = probationRegionFactory.buildList(5)
      referenceDataClient.getReferenceData.mockResolvedValue(probationRegions)
      const response = createMock<Response>()
      ;(
        bookingReportForProbationRegionFilename as jest.MockedFunction<typeof bookingReportForProbationRegionFilename>
      ).mockReturnValue('some-filename')

      await service.pipeBookingsForProbationRegion(callConfig, response, probationRegions[0].id)

      expect(ReportClientFactory).toHaveBeenCalledWith(token)
      expect(bookingReportForProbationRegionFilename).toHaveBeenCalledWith(probationRegions[0])
      expect(reportClient.bookingsForProbationRegion).toHaveBeenCalledWith(
        response,
        'some-filename',
        probationRegions[0].id,
      )
    })
  })

  describe('getReferenceData', () => {
    it('should return the probation regions', async () => {
      const probationRegions = probationRegionFactory.buildList(5)

      referenceDataClient.getReferenceData.mockResolvedValue(probationRegions)

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({ probationRegions })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-regions')
    })
  })
})
