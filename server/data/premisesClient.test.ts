import nock from 'nock'

import type { Premises } from 'approved-premises'
import PremisesClient from './premisesClient'
import config from '../config'

describe('PremisesClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let premisesClient: PremisesClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    premisesClient = new PremisesClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getAllPremises', () => {
    const premises: Premises[] = []

    it('should get all premises', async () => {
      fakeApprovedPremisesApi.get('/premises').matchHeader('authorization', `Bearer ${token}`).reply(200, premises)

      const output = await premisesClient.getAllPremises()
      expect(output).toEqual(premises)
    })
  })
})
