import nock from 'nock'

import PremisesClient from './premisesClient'
import { CallConfig } from '../restClient'
import config from '../../config'
import {
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UpdatePremisesFactory,
} from '../../testutils/factories'
import paths from '../../paths/api'

describe('PremisesClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let premisesClient: PremisesClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
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
        .get(paths.cas3.premises.search({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({
          postcodeOrAddress: 'NE1 1AB',
          premisesStatus: 'online',
          sortBy: 'pdu',
        })
        .reply(200, searchResults)

      const output = await premisesClient.search('NE1 1AB', 'online', 'pdu')
      expect(output).toEqual(searchResults)
    })
  })

  describe('find', () => {
    it('should get a single premises by id', async () => {
      const premisesId = 'premises-id'
      const premises = cas3PremisesFactory.build({ id: premisesId })

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.show({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const output = await premisesClient.find(premisesId)
      expect(output).toEqual(premises)
    })
  })

  describe('create', () => {
    it('should return the premises that has been created', async () => {
      const premises = cas3PremisesFactory.build()
      const payload = cas3NewPremisesFactory.build({ ...premises })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.create({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.create(payload)
      expect(result).toEqual(premises)
    })
  })

  describe('update', () => {
    it('should return the premises that has been updated', async () => {
      const premisesId = 'premises-id'
      const premises = cas3PremisesFactory.build({ id: premisesId })
      const payload = cas3UpdatePremisesFactory.build({ ...premises })

      fakeApprovedPremisesApi
        .put(paths.cas3.premises.update({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.update(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })
})
