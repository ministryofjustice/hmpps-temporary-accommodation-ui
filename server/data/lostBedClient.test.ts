import nock from 'nock'

import LostBedClient from './lostBedClient'
import config from '../config'
import lostBedFactory from '../testutils/factories/lostBed'
import newLostBedFactory from '../testutils/factories/newLostBed'
import { CallConfig } from './restClient'
import paths from '../paths/api'

describe('LostBedClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let lostBedClient: LostBedClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    lostBedClient = new LostBedClient(callConfig)
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
        .post(paths.premises.lostBeds.create({ premisesId: 'premisesId' }), newLostBed)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, lostBed)

      const result = await lostBedClient.create('premisesId', newLostBed)

      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should return the lost bed that has been requested', async () => {
      const lostBed = lostBedFactory.build()

      fakeApprovedPremisesApi
        .get(paths.premises.lostBeds.show({ premisesId: 'premisesId', lostBedId: 'lostBedId' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, lostBed)

      const result = await lostBedClient.find('premisesId', 'lostBedId')

      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('allLostBedsForPremisesId', () => {
    it('should return all lost beds for a given premises ID', async () => {
      const lostBeds = lostBedFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.premises.lostBeds.index({ premisesId: 'premisesId' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, lostBeds)

      const result = await lostBedClient.allLostBedsForPremisesId('premisesId')

      expect(result).toEqual(lostBeds)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
