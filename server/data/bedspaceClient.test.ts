import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import { bedspaceSearchApiParametersFactory, bedspaceSearchResultsFactory } from '../testutils/factories'
import BedspaceClient from './bedspaceClient'
import { CallConfig } from './restClient'

describe('BedClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bedspaceClient: BedspaceClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    bedspaceClient = new BedspaceClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('search', () => {
    it('returns search results', async () => {
      const results = bedspaceSearchResultsFactory.build()
      const payload = bedspaceSearchApiParametersFactory.build()

      fakeApprovedPremisesApi
        .post(paths.bedspaces.search({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, results)

      const result = await bedspaceClient.search(payload)

      expect(result).toEqual(results)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
