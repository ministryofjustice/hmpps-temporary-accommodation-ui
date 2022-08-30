import nock from 'nock'

import premisesFactory from '../testutils/factories/premises'
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

  describe('all', () => {
    const premises = premisesFactory.buildList(5)

    it('should get all premises', async () => {
      fakeApprovedPremisesApi.get('/premises').matchHeader('authorization', `Bearer ${token}`).reply(200, premises)

      const output = await premisesClient.all()
      expect(output).toEqual(premises)
    })
  })

  describe('find', () => {
    const premises = premisesFactory.build()

    it('should get a single premises', async () => {
      fakeApprovedPremisesApi
        .get(`/premises/${premises.id}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, premises)

      const output = await premisesClient.find(premises.id)
      expect(output).toEqual(premises)
    })
  })
})
