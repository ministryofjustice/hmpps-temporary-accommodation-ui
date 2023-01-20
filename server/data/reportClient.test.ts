import nock from 'nock'

import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import config from '../config'
import paths from '../paths/api'
import ReportClient from './reportClient'
import probationRegionFactory from '../testutils/factories/probationRegion'
import { createMockRequest } from '../testutils/createMockRequest'

describe('ReportClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let reportClient: ReportClient

  const request = createMockRequest()

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    reportClient = new ReportClient(request)
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

      fakeApprovedPremisesApi
        .get(paths.reports.bookings({}))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.bookings(response, 'some-filename')

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

      fakeApprovedPremisesApi
        .get(paths.reports.bookings({}))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.bookings(response, 'some-filename')

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
    })
  })

  describe('bookingsForProbationRegion', () => {
    it('pipes bookings for a probation region to an express response', async () => {
      const probationRegion = probationRegionFactory.build()

      const data = 'some-data'

      fakeApprovedPremisesApi
        .get(paths.reports.bookings({}))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .query({ probationRegionId: probationRegion.id })
        .reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await reportClient.bookingsForProbationRegion(response, 'some-filename', probationRegion.id)

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
    })
  })
})
