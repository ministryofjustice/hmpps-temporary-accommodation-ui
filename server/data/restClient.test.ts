import nock from 'nock'

import type { ApiConfig } from '../config'
import RestClient from './restClient'

describe('restClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let restClient: RestClient

  const token = 'token-1'

  beforeEach(() => {
    const apiConfig: ApiConfig = {
      url: 'http://example.com:8000',
      timeout: {
        response: 1000,
        deadline: 1000,
      },
      agent: { timeout: 1000 },
    }

    fakeApprovedPremisesApi = nock(apiConfig.url)
    restClient = new RestClient('premisesClient', apiConfig, token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('post', () => {
    it('should filter out blank values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = { some: 'data', empty: '', undefinedItem: undefined, nullItem: null } as any

      fakeApprovedPremisesApi
        .post(`/some/path`, { some: 'data' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, { some: 'data' })

      const result = await restClient.post({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data' })
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('put', () => {
    it('should filter out blank values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = { some: 'data', empty: '', undefinedItem: undefined, nullItem: null } as any

      fakeApprovedPremisesApi
        .put(`/some/path`, { some: 'data' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, { some: 'data' })

      const result = await restClient.put({ path: '/some/path', data })

      expect(result).toEqual({ some: 'data' })
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
