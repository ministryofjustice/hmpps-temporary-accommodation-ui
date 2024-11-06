import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import nock from 'nock'
import { Readable } from 'stream'
import type { ApiConfig } from '../config'
import { probationRegionFactory } from '../testutils/factories'
import RestClient, { CallConfig } from './restClient'
import logger from '../../logger'

jest.mock('../../logger')

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
      const data: Record<string, unknown> = {
        some: 'data',
        empty: '',
        undefinedItem: undefined,
        nullItem: null,
        falseItem: false,
        nanItem: Number.NaN,
      }

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
      const data: Record<string, unknown> = {
        some: 'data',
        empty: '',
        undefinedItem: undefined,
        nullItem: null,
        falseItem: false,
        zeroItem: 0,
        nanItem: Number.NaN,
      }

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
    const response = createMock<Response>({})
    const mockReadStream = jest.fn().mockImplementation(() => {
      const readable = new Readable()
      readable.push('hello')
      readable.push('world')
      readable.push(null)

      return readable
    })

    it('should pipe a streaming response to a response', async () => {
      fakeApprovedPremisesApi.get('/some/path').reply(200, () => mockReadStream())

      const writeSpy = jest.spyOn(response, 'write')

      await restClient.pipe(response, { path: '/some/path' })

      expect(writeSpy).toHaveBeenCalledWith(Buffer.from('hello', 'utf-8'))
      expect(writeSpy).toHaveBeenCalledWith(Buffer.from('world', 'utf-8'))

      expect(nock.isDone()).toBeTruthy()
    })

    it('should send the content-disposition header to the response', async () => {
      fakeApprovedPremisesApi
        .get('/some/path')
        .reply(200, () => mockReadStream(), { 'content-disposition': 'attachment; filename=foo.txt' })

      const setSpy = jest.spyOn(response, 'set')

      await restClient.pipe(response, { path: '/some/path', passThroughHeaders: ['content-disposition'] })

      expect(setSpy).toHaveBeenCalledWith('content-disposition', 'attachment; filename=foo.txt')
    })

    it('should throw error if the response is unsuccessful', async () => {
      fakeApprovedPremisesApi.get('/some/path').reply(404)

      const loggerSpy = jest.spyOn(logger, 'warn')

      await expect(restClient.pipe(response, { path: '/some/path' })).rejects.toThrowError(
        'cannot GET /some/path (404)',
      )

      expect(loggerSpy).toHaveBeenCalledWith(new Error('cannot GET /some/path (404)'), 'Error calling premisesClient')

      nock.cleanAll()
    })
  })
})
