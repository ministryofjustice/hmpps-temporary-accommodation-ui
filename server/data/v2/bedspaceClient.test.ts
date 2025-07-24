import nock from 'nock'
import BedspaceClient from './bedspaceClient'
import { CallConfig } from '../restClient'
import config from '../../config'
import { cas3BedspaceFactory, cas3BedspacesFactory, cas3NewBedspaceFactory } from '../../testutils/factories'
import paths from '../../paths/api'

describe('BedspaceClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let bedspaceClient: BedspaceClient

  const callConfig = { token: 'some-token' } as CallConfig
  const premisesId = 'some-premises-id'

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

  describe('find', () => {
    it('should return bedspace', async () => {
      const bedspaceId = 'some-bedspace-id'
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

  describe('archive', () => {
    it('should archive a bedspace', async () => {
      const bedspaceId = 'some-bedspace-id'
      const archiveData = { endDate: '2024-12-31' }

      fakeApprovedPremisesApi
        .post(paths.cas3.premises.bedspaces.archive({ premisesId, bedspaceId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await bedspaceClient.archive(premisesId, bedspaceId, archiveData)
    })
  })
})
