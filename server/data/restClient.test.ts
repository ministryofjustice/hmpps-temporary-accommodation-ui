import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import nock from 'nock'

import type { ApiConfig } from '../config'
import { createMockRequest } from '../testutils/createMockRequest'
import RestClient from './restClient'

describe('restClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let restClient: RestClient

  const request = createMockRequest()

  const apiConfig: ApiConfig = {
    url: 'http://example.com:8000',
    timeout: {
      response: 1000,
      deadline: 1000,
    },
    agent: { timeout: 1000 },
    serviceName: 'approved-premises',
  }

  fakeApprovedPremisesApi = nock(apiConfig.url, {
    reqheaders: {
      authorization: `Bearer ${request.user.token}`,
      'X-SERVICE-NAME': 'approved-premises',
      'X-USER-REGION': request.session.actingUserProbationRegion.id,
    },
  })
  restClient = new RestClient('premisesClient', apiConfig, request)

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('get', () => {
    it('should make a GET request', async () => {
      fakeApprovedPremisesApi.get(`/some/path`).reply(200, { some: 'data' })

      const result = await restClient.get({ path: '/some/path' })

      expect(result).toEqual({ some: 'data' })
      expect(nock.isDone()).toBeTruthy()
    })

    it('should omit the X-SERVICE-NAME header when the configuration does not include a service name', async () => {
      const apiConfigWithoutServiceName: ApiConfig = {
        ...apiConfig,
      }
      delete apiConfigWithoutServiceName.serviceName

      fakeApprovedPremisesApi = nock(apiConfig.url, {
        reqheaders: {
          authorization: `Bearer ${request.user.token}`,
        },
        badheaders: ['X-SERVICE-NAME'],
      })
      restClient = new RestClient('premisesClient', apiConfigWithoutServiceName, request)

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, { some: 'data' })

      await restClient.get({ path: '/some/path' })

      expect(nock.isDone()).toBeTruthy()
    })

    it('should omit the X-USER-REGION header when the session does not include a user region', async () => {
      const requestWithoutUserRegion = createMockRequest()
      delete requestWithoutUserRegion.session.actingUserProbationRegion

      fakeApprovedPremisesApi = nock(apiConfig.url, {
        reqheaders: {
          authorization: `Bearer ${request.user.token}`,
        },
        badheaders: ['X-USER-REGION'],
      })
      restClient = new RestClient('premisesClient', apiConfig, requestWithoutUserRegion)

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, { some: 'data' })

      await restClient.get({ path: '/some/path' })

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('post', () => {
    it('should filter out blank values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = { some: 'data', empty: '', undefinedItem: undefined, nullItem: null } as any

      fakeApprovedPremisesApi.post(`/some/path`, { some: 'data' }).reply(201, { some: 'data' })

      const result = await restClient.post({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data' })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('put', () => {
    it('should filter out blank values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = { some: 'data', empty: '', undefinedItem: undefined, nullItem: null } as any

      fakeApprovedPremisesApi.put(`/some/path`, { some: 'data' }).reply(201, { some: 'data' })

      const result = await restClient.put({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data' })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('pipe', () => {
    it('should make a GET request and pipe the response', async () => {
      const data = 'some-data'

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await restClient.pipe(response, 'some-filename', { path: '/some/path' })

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(nock.isDone()).toBeTruthy()
    })
  })

  it('should reject when the API returns an error', async () => {
    fakeApprovedPremisesApi.get(`/some/path`).reply(500, { some: 'data' })

    const response = createMock<Response>()

    await expect(restClient.pipe(response, 'some-filename', { path: '/some/path' })).rejects.toBeDefined()

    expect(response.set).not.toHaveBeenCalledWith()
    expect(response.write).not.toHaveBeenCalled()
    expect(nock.isDone()).toBeTruthy()
  })
})
