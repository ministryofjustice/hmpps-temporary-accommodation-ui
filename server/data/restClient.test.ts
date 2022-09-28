import nock from 'nock'

import config, { ApiConfig } from '../config'
import RestClient from './restClient'

describe('restClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let restClient: RestClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
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
