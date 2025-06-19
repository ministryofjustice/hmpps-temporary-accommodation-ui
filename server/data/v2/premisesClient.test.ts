import nock from 'nock'

import PremisesClient from './premisesClient'
import { CallConfig } from '../restClient'
import config from '../../config'
import { cas3PremisesSearchResultFactory, cas3PremisesSearchResultsFactory } from '../../testutils/factories'
import paths from '../../paths/api'

describe('PremisesCLeint', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let premisesClient: PremisesClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http:/localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    premisesClient = new PremisesClient(callConfig)
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
    it.each([
      [cas3PremisesSearchResultsFactory.build({ results: cas3PremisesSearchResultFactory.buildList(5) })],
      [cas3PremisesSearchResultsFactory.build({ results: cas3PremisesSearchResultFactory.buildList(0) })],
    ])('should get premises search results', async searchResults => {
      fakeApprovedPremisesApi
        .get(paths.v2.premises.index({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({
          postcodeOrAddress: 'NE1 1AB',
          premisesStatus: 'online',
        })
        .reply(200, searchResults)

      const output = await premisesClient.search('NE1 1AB', 'online')
      expect(output).toEqual(searchResults)
    })
  })
})
