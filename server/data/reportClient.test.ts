import nock from 'nock'

import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import config from '../config'
import paths from '../paths/api'
import { probationRegionFactory } from '../testutils/factories'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'

describe('ReportClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let reportClient: ReportClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    reportClient = new ReportClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('bookings', () => {
    it('pipes all bookings to an express response', async () => {
      const data = 'some-data'

      const year = '2023'
      const month = '3'

      fakeApprovedPremisesApi
        .get(paths.reports.bookings({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({ year, month })
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.bookings(response, 'some-filename', month, year)

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
    })
  })

  describe('bookings', () => {
    it('pipes all bookings to an express response', async () => {
      const data = 'some-data'

      const year = '2024'
      const month = '0'

      fakeApprovedPremisesApi
        .get(paths.reports.bookings({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({ year, month })
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.bookings(response, 'some-filename', month, year)

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
    })
  })

  describe('reportForProbationRegion', () => {
    it('pipes data for a probation region to an express response', async () => {
      const probationRegion = probationRegionFactory.build()

      const data = 'some-data'
      const startDate = '2024-01-01'
      const endDate = '2024-04-01'
      const type = 'bedOccupancy'

      fakeApprovedPremisesApi
        .get(paths.reports.bedspaceUtilisation({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({ probationRegionId: probationRegion.id, startDate, endDate })
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.reportForProbationRegion(
        response,
        'some-filename',
        probationRegion.id,
        startDate,
        endDate,
        type,
      )

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
    })
  })
})
