import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import { Cas3ReportType } from '@approved-premises/api'
import { ReportClient } from '../data'
import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import { probationRegionFactory } from '../testutils/factories'
import { reportFilename, reportForProbationRegionFilename } from '../utils/reportUtils'
import ReportService from './reportService'

jest.mock('../data/reportClient.ts')
jest.mock('../data/referenceDataClient.ts')
jest.mock('../utils/reportUtils')

describe('ReportService', () => {
  const reportClient = new ReportClient(null) as jest.Mocked<ReportClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const ReportClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const callConfig = { token: 'some-token' } as CallConfig

  const service = new ReportService(ReportClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    ReportClientFactory.mockReturnValue(reportClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('pipeBookings', () => {
    it('pipes all bookings to an express response, for download as a file', async () => {
      const response = createMock<Response>()
      ;(reportFilename as jest.MockedFunction<typeof reportFilename>).mockReturnValue('some-filename')
      const month = '1'
      const year = '2023'

      await service.pipeBookings(callConfig, response, month, year)

      expect(ReportClientFactory).toHaveBeenCalledWith(callConfig)
      expect(reportFilename).toHaveBeenCalled()
      expect(reportClient.bookings).toHaveBeenCalledWith(response, 'some-filename', month, year)
    })
  })

  describe('pipeReportForProbationRegion', () => {
    it('pipes all bookings to an express response, for download as a file', async () => {
      const probationRegions = probationRegionFactory.buildList(5)
      referenceDataClient.getReferenceData.mockResolvedValue(probationRegions)
      const response = createMock<Response>()
      ;(
        reportForProbationRegionFilename as jest.MockedFunction<typeof reportForProbationRegionFilename>
      ).mockReturnValue('some-filename')
      const startDate = '2023-10-11'
      const endDate = '2023-12-11'
      const type = 'bedUsage'

      await service.pipeReportForProbationRegion(callConfig, response, probationRegions[0].id, startDate, endDate, type)

      expect(ReportClientFactory).toHaveBeenCalledWith(callConfig)
      expect(reportForProbationRegionFilename).toHaveBeenCalledWith(probationRegions[0].name, startDate, endDate, type)
      expect(reportClient.reportForProbationRegion).toHaveBeenCalledWith(
        response,
        'some-filename',
        probationRegions[0].id,
        startDate,
        endDate,
        type,
      )
    })

    it('produces a report for all regions', async () => {
      const response = createMock<Response>()
      ;(
        reportForProbationRegionFilename as jest.MockedFunction<typeof reportForProbationRegionFilename>
      ).mockReturnValue('some-filename')

      const startDate = '2024-02-01'
      const endDate = '2024-03-01'
      const type: Cas3ReportType = 'bedOccupancy'

      await service.pipeReportForProbationRegion(callConfig, response, 'all', startDate, endDate, type)

      expect(reportForProbationRegionFilename).toHaveBeenCalledWith('All regions', startDate, endDate, type)
      expect(reportClient.reportForProbationRegion).toHaveBeenCalledWith(
        response,
        'some-filename',
        '',
        startDate,
        endDate,
        type,
      )
    })
  })

  describe('getReferenceData', () => {
    it('should return the probation regions', async () => {
      const probationRegions = probationRegionFactory.buildList(5)

      referenceDataClient.getReferenceData.mockResolvedValue(probationRegions)

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({ probationRegions })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(callConfig)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-regions')
    })
  })
})
