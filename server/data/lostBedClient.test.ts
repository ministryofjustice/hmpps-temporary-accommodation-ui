import nock from 'nock'

import LostBedClient from './lostBedClient'
import config from '../config'
import lostBedFactory from '../testutils/factories/lostBed'
import newLostBedFactory from '../testutils/factories/newLostBed'

describe('LostBedClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let lostBedClient: LostBedClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    lostBedClient = new LostBedClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('create', () => {
    it('should create a lostBed', async () => {
      const lostBed = lostBedFactory.build()
      const newLostBed = newLostBedFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/lost-beds`, newLostBed)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, lostBed)

      const result = await lostBedClient.create('premisesId', newLostBed)

      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
