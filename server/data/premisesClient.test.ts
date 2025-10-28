import nock from 'nock'

import PremisesClient from './premisesClient'
import { CallConfig } from './restClient'
import config from '../config'
import {
  cas3ArchivePremisesFactory,
  cas3BedspacesReferenceFactory,
  cas3NewPremisesFactory,
  cas3PremisesBedspaceTotalsFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UnarchivePremisesFactory,
  cas3UpdatePremisesFactory,
} from '../testutils/factories'
import paths from '../paths/api'

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
        })
        .reply(200, searchResults)

      const output = await premisesClient.search('NE1 1AB', 'online')
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

  describe('canArchive', () => {
    it('should return the bedspace references that are preventing a premises from being archived', async () => {
      const premisesId = '6b0ef164-1078-4186-9b31-5fb1de20c9ac'
      const bedspacesReference = cas3BedspacesReferenceFactory.build()

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.canArchive({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspacesReference)

      const result = await premisesClient.canArchive(premisesId)
      expect(result).toEqual(bedspacesReference)
    })
  })

  describe('archive', () => {
    it('should return the premises that has been archived', async () => {
      const premisesId = 'fc321526-7d54-4e1b-94b4-8df4225d0763'
      const premises = cas3PremisesFactory.build({ id: premisesId })
      const payload = cas3ArchivePremisesFactory.build()

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.archive({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.archive(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })

  describe('unarchive', () => {
    it('should return the premises that has been unarchived', async () => {
      const premisesId = 'fc321526-7d54-4e1b-94b4-8df4225d0763'
      const premises = cas3PremisesFactory.build({ id: premisesId })
      const payload = cas3UnarchivePremisesFactory.build()

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.unarchive({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.unarchive(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })

  describe('cancelArchive', () => {
    it('should return the premises that has been archive cancelled', async () => {
      const premisesId = 'fc321526-7d54-4e1b-94b4-8df4225d0763'
      const premises = cas3PremisesFactory.build({ id: premisesId, endDate: null })

      fakeApprovedPremisesApi
        .put(paths.cas3.premises.cancelArchive({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.cancelArchive(premisesId)
      expect(result).toEqual(premises)
    })
  })

  describe('cancelUnarchive', () => {
    it('should return the premises that has been unarchive cancelled', async () => {
      const premisesId = 'fc321526-7d54-4e1b-94b4-8df4225d0763'
      const premises = cas3PremisesFactory.build({ id: premisesId, scheduleUnarchiveDate: null })

      fakeApprovedPremisesApi
        .put(paths.cas3.premises.cancelUnarchive({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const result = await premisesClient.cancelUnarchive(premisesId)
      expect(result).toEqual(premises)
    })
  })

  describe('totals', () => {
    it('should return the bedspace totals for a premises', async () => {
      const premisesId = 'premises-id'
      const totals = cas3PremisesBedspaceTotalsFactory.build()

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.totals({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, totals)

      const result = await premisesClient.totals(premisesId)
      expect(result).toEqual(totals)
    })
  })
})
