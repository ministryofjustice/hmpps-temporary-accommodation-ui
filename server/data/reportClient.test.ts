import nock from 'nock'
import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import { Readable } from 'stream'
import { Cas3ReportType } from '@approved-premises/api'
import config from '../config'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'

jest.mock('superagent', () => ({
  get: jest.fn().mockReturnThis(), // Mock the .get method of superagent
  pipe: jest.fn(), // Mock the .pipe method
}))

describe('ReportClient', () => {
  let reportClient: ReportClient
  let mockStream: Readable
  let filename: string
  let probationRegionId: string
  let startDate: string
  let endDate: string
  let type: Cas3ReportType
  let mockResponse: Response
  let restClientMock: { pipe: jest.Mock }

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    // Mock the restClient instance and its pipe method
    restClientMock = {
      pipe: jest.fn(),
    }

    // Mock the ReportClient's restClient property
    config.apis.approvedPremises.url = 'http://localhost:8080'
    reportClient = new ReportClient(callConfig)
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    reportClient.restClient = restClientMock as any

    filename = 'report.csv'
    probationRegionId = '12345'
    startDate = '2024-01-01'
    endDate = '2024-01-31'
    type = 'referral'

    // Create a mock stream that has an `on` method (simulating a Readable stream)
    mockStream = new Readable({
      read() {
        // We don't need to do anything for this simple mock
      },
    })

    mockResponse = createMock<Response>()
    restClientMock.pipe.mockReturnValue(mockStream)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('reportForProbationRegion', () => {
    it('should call restClient.pipe with correct arguments', async () => {
      await reportClient.reportForProbationRegion(mockResponse, filename, probationRegionId, startDate, endDate, type)

      expect(restClientMock.pipe).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          path: expect.any(String),
          query: {
            probationRegionId,
            startDate,
            endDate,
          },
          filename,
        }),
      )
    })

    it('should handle the stream properly when restClient.pipe returns a stream', async () => {
      const result = await reportClient.reportForProbationRegion(
        mockResponse,
        filename,
        probationRegionId,
        startDate,
        endDate,
        type,
      )

      expect(result).toBeUndefined()
      expect(restClientMock.pipe).toHaveReturnedWith(mockStream)

      expect(mockStream.on).toBeDefined()

      const eventCallback = jest.fn()
      mockStream.on('data', eventCallback)
      expect(eventCallback).not.toHaveBeenCalled()
    })

    it('should throw an error if restClient.pipe fails', async () => {
      const error = new Error('Failed to pipe')
      restClientMock.pipe.mockImplementationOnce(() => {
        throw error
      })

      await expect(
        reportClient.reportForProbationRegion(mockResponse, filename, probationRegionId, startDate, endDate, type),
      ).rejects.toThrow('Failed to pipe')
    })
  })
})
