import nock from 'nock'
import BedspaceClient from './bedspaceClient'
import { CallConfig } from './restClient'
import config from '../config'
import {
  bedspaceSearchApiParametersFactory,
  bedspaceSearchResultsFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewBedspaceFactory,
  cas3UpdateBedspaceFactory,
} from '../testutils/factories'
import paths from '../paths/api'

describe('BedspaceClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bedspaceClient: BedspaceClient

  const callConfig = { token: 'some-token' } as CallConfig
  const premisesId = 'some-premises-id'
  const bedspaceId = 'some-bedspace-id'

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

  describe('find', () => {
    it('should return bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build({ id: bedspaceId })

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.bedspaces.show({ premisesId, bedspaceId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspace)

      const output = await bedspaceClient.find(premisesId, bedspaceId)
      expect(output).toEqual(bedspace)
    })
  })

  describe('create', () => {
    it('should return the bedspace that has been created', async () => {
      const bedspace = cas3BedspaceFactory.build()

      const payload = cas3NewBedspaceFactory.build({
        reference: bedspace.reference,
        notes: bedspace.notes,
      })

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bedspaces.create({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspace)

      const output = await bedspaceClient.create(premisesId, payload)
      expect(output).toEqual(bedspace)
    })
  })

  describe('get', () => {
    it('should return the bedspaces for a premises', async () => {
      const bedspaces = cas3BedspacesFactory.build()

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.bedspaces.get({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspaces)

      const output = await bedspaceClient.get(premisesId)
      expect(output).toEqual(bedspaces)
    })
  })

  describe('update', () => {
    it('should return the bedspace that has been updated', async () => {
      const bedspace = cas3BedspaceFactory.build()

      const payload = cas3UpdateBedspaceFactory.build({
        reference: bedspace.reference,
        notes: bedspace.notes,
        characteristicIds: bedspace.characteristics.map(ch => ch.id),
      })

      fakeApprovedPremisesApi
        .put(paths.cas3.premises.bedspaces.update({ premisesId, bedspaceId: bedspace.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspace)

      const result = await bedspaceClient.update(premisesId, bedspace.id, payload)
      expect(result).toEqual(bedspace)
    })
  })

  describe('cancelArchive', () => {
    it('should return the bedspace after cancelling the archive', async () => {
      const bedspace = cas3BedspaceFactory.build({ id: bedspaceId })

      fakeApprovedPremisesApi
        .put(paths.cas3.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, bedspace)

      const result = await bedspaceClient.cancelArchive(premisesId, bedspaceId)
      expect(result).toEqual(bedspace)
    })
  })
})
