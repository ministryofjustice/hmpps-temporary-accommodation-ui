import nock from 'nock'
import BedspaceClient from './bedspaceClient'
import { CallConfig } from '../restClient'
import config from '../../config'
import { cas3BedspaceFactory } from '../../testutils/factories'
import paths from '../../paths/api'

describe('BedspaceClient', () => {
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

  describe('find', () => {
    it('should return bedspace', async () => {
      const premisesId = 'some-premises-id'
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
})
