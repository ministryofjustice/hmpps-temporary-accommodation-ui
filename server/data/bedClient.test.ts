import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import { bedSearchParametersFactory, bedSearchResultsFactory } from '../testutils/factories'
import BedClient from './bedClient'
import { CallConfig } from './restClient'

describe('BedClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bedClient: BedClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    bedClient = new BedClient(callConfig)
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
      const results = bedSearchResultsFactory.build()
      const payload = bedSearchParametersFactory.build()

      fakeApprovedPremisesApi
        .post(paths.beds.search({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, results)

      const result = await bedClient.search(payload)

      expect(result).toEqual(results)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
