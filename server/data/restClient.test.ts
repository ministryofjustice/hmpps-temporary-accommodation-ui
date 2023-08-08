import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import nock from 'nock'
import type { ApiConfig } from '../config'
import { probationRegionFactory } from '../testutils/factories'
import RestClient, { CallConfig } from './restClient'

describe('restClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let restClient: RestClient

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig
  const apiConfig: ApiConfig = {
    url: 'http://example.com:8000',
    timeout: {
      response: 1000,
      deadline: 1000,
    },
    agent: { timeout: 1000 },
    serviceName: 'approved-premises',
  }

  beforeEach(() => {
    fakeApprovedPremisesApi = nock(apiConfig.url, {
      reqheaders: {
        authorization: `Bearer ${callConfig.token}`,
        'X-SERVICE-NAME': 'approved-premises',
        'X-USER-REGION': callConfig.probationRegion.id,
      },
    })
    restClient = new RestClient('premisesClient', apiConfig, callConfig)
  })

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
          authorization: `Bearer ${callConfig.token}`,
        },
        badheaders: ['X-SERVICE-NAME'],
      })
      restClient = new RestClient('premisesClient', apiConfigWithoutServiceName, callConfig)

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, { some: 'data' })

      await restClient.get({ path: '/some/path' })

      expect(nock.isDone()).toBeTruthy()
    })

    it('should omit the X-USER-REGION header when the call config does not include a user region', async () => {
      const callConfigWithoutUserRegion = { token: 'some-token' } as CallConfig

      fakeApprovedPremisesApi = nock(apiConfig.url, {
        reqheaders: {
          authorization: `Bearer ${callConfig.token}`,
        },
        badheaders: ['X-USER-REGION'],
      })
      restClient = new RestClient('premisesClient', apiConfig, callConfigWithoutUserRegion)

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, { some: 'data' })

      await restClient.get({ path: '/some/path' })

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('post', () => {
    it('should filter out blank values and replace NaNs with a known string', async () => {
      const data = {
        some: 'data',
        empty: '',
        undefinedItem: undefined,
        nullItem: null,
        falseItem: false,
        nanItem: Number.NaN,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      fakeApprovedPremisesApi
        .post(`/some/path`, { some: 'data', falseItem: false, nanItem: 'not-a-number' })
        .reply(201, { some: 'data', falseItem: false, nanItem: 'not-a-number' })

      const result = await restClient.post({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data', falseItem: false, nanItem: 'not-a-number' })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('put', () => {
    it('should filter out blank values and replace NaNs with a known string', async () => {
      const data = {
        some: 'data',
        empty: '',
        undefinedItem: undefined,
        nullItem: null,
        falseItem: false,
        zeroItem: 0,
        nanItem: Number.NaN,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      fakeApprovedPremisesApi
        .put(`/some/path`, { some: 'data', falseItem: false, zeroItem: 0, nanItem: 'not-a-number' })
        .reply(201, { some: 'data', falseItem: false, zeroItem: 0, nanItem: 'not-a-number' })

      const result = await restClient.put({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data', falseItem: false, zeroItem: 0, nanItem: 'not-a-number' })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      fakeApprovedPremisesApi.delete(`/some/path`).reply(200)

      await restClient.delete({ path: '/some/path' })

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('pipe', () => {
    it('should make a GET request and pipe the response, using the specified filename', async () => {
      const data = 'some-data'

      fakeApprovedPremisesApi.get(`/some/path`).reply(200, data, { 'content-type': 'some-content-type' })

      const response = createMock<Response>()

      await restClient.pipe(response, { path: '/some/path', filename: 'some-filename' })

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': 'attachment; filename="some-filename"',
      })

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(nock.isDone()).toBeTruthy()
    })

    it('should make a GET request and pipe the response, using the filename from the API when none is specified', async () => {
      const data = 'some-data'
      fakeApprovedPremisesApi.get(`/some/path`).reply(200, data, {
        'content-type': 'some-content-type',
        'content-disposition': 'attachment; filename="some-filename"',
      })

      const response = createMock<Response>()

      await restClient.pipe(response, { path: '/some/path' })

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'some-content-type',
        'Content-Disposition': 'attachment; filename="some-filename"',
      })

      expect(response.write).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
      expect(nock.isDone()).toBeTruthy()
    })
  })

  it('should reject when the API returns an error', async () => {
    fakeApprovedPremisesApi.get(`/some/path`).reply(500, { some: 'data' })

    const response = createMock<Response>()

    await expect(restClient.pipe(response, { path: '/some/path' })).rejects.toBeDefined()

    expect(response.set).not.toHaveBeenCalledWith()
    expect(response.write).not.toHaveBeenCalled()
    expect(nock.isDone()).toBeTruthy()
  })
})
