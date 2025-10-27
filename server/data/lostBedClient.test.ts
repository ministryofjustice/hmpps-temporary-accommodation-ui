import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import {
  cas3VoidBedspaceCancellationFactory,
  cas3VoidBedspaceFactory,
  cas3VoidBedspaceRequestFactory,
  lostBedFactory,
} from '../testutils/factories'
import LostBedClient from './lostBedClient'
import { CallConfig } from './restClient'

describe('LostBedClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let lostBedClient: LostBedClient

  const callConfig = { token: 'some-token' } as CallConfig

  const flagsConfigOriginal = config.flags

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.enableCas3v2Api = true
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

    config.flags = flagsConfigOriginal
  })

  describe('create', () => {
    it('should create a lostBed', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()
      const newLostBed = cas3VoidBedspaceRequestFactory.build()

      fakeApprovedPremisesApi
        .post(
          paths.cas3.premises.voidBedspaces.create({ premisesId: 'premisesId', bedspaceId: lostBed.id }),
          newLostBed,
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, lostBed)

      const result = await lostBedClient.create('premisesId', lostBed.id, newLostBed)

      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should return the lost bed that has been requested', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()

      fakeApprovedPremisesApi
        .get(
          paths.cas3.premises.voidBedspaces.show({
            premisesId: 'premisesId',
            bedspaceId: 'bedspaceId',
            voidBedspaceId: 'voidBedspaceId',
          }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, lostBed)

      const result = await lostBedClient.find('premisesId', 'bedspaceId', 'voidBedspaceId')

      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('allLostBedsForPremisesId', () => {
    it('should return all lost beds for a given premises ID', async () => {
      const lostBeds = cas3VoidBedspaceFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.cas3.premises.voidBedspaces.index({ premisesId: 'premisesId' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, lostBeds)

      const result = await lostBedClient.allLostBedsForPremisesId('premisesId')

      expect(result).toEqual(lostBeds)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('update', () => {
    it('updates and returns the given lost bed', async () => {
      const lostBed = cas3VoidBedspaceFactory.build()
      const payload = cas3VoidBedspaceRequestFactory.build(lostBed)

      fakeApprovedPremisesApi
        .put(
          paths.cas3.premises.voidBedspaces.update({
            premisesId: 'premisesId',
            bedspaceId: lostBed.bedspaceId,
            voidBedspaceId: lostBed.id,
          }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, lostBed)

      const result = await lostBedClient.update('premisesId', lostBed.bedspaceId, lostBed.id, payload)
      expect(result).toEqual(lostBed)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const newLostBedCancellation = cas3VoidBedspaceCancellationFactory.build()

      fakeApprovedPremisesApi
        .put(
          paths.cas3.premises.voidBedspaces.cancel({
            premisesId: 'premisesId',
            bedspaceId: 'bedspaceId',
            voidBedspaceId: 'lostBedId',
          }),
          newLostBedCancellation,
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, newLostBedCancellation)

      const result = await lostBedClient.cancel('premisesId', 'bedspaceId', 'lostBedId', newLostBedCancellation)
      expect(result).toEqual(newLostBedCancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('with the ENABLE_CAS3V2_API flag off', () => {
    beforeEach(() => {
      config.flags.enableCas3v2Api = false
    })

    describe('create', () => {
      it('should create a lostBed', async () => {
        const lostBed = lostBedFactory.build()
        const newLostBed = cas3VoidBedspaceRequestFactory.build()

        const { reasonId, ...sharedProperties } = newLostBed

        fakeApprovedPremisesApi
          .post(paths.premises.lostBeds.create({ premisesId: 'premisesId' }), {
            ...sharedProperties,
            reason: reasonId,
            bedId: lostBed.bedId,
          })
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(201, lostBed)

        const result = await lostBedClient.create('premisesId', lostBed.bedId, newLostBed)

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

        const result = await lostBedClient.find('premisesId', lostBed.bedId, 'lostBedId')

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

    describe('update', () => {
      it('updates and returns the given lost bed', async () => {
        const lostBed = lostBedFactory.build()
        const payload = cas3VoidBedspaceRequestFactory.build()

        const { reasonId, ...sharedProperties } = payload

        fakeApprovedPremisesApi
          .put(paths.premises.lostBeds.update({ premisesId: 'premisesId', lostBedId: lostBed.id }), {
            ...sharedProperties,
            reason: reasonId,
            bedId: lostBed.bedId,
          })
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, lostBed)

        const result = await lostBedClient.update('premisesId', lostBed.bedId, lostBed.id, payload)
        expect(result).toEqual(lostBed)
        expect(nock.isDone()).toBeTruthy()
      })
    })

    describe('cancel', () => {
      it('should create a cancellation', async () => {
        const newLostBedCancellation = cas3VoidBedspaceCancellationFactory.build()

        fakeApprovedPremisesApi
          .post(paths.premises.lostBeds.cancel({ premisesId: 'premisesId', lostBedId: 'lostBedId' }), {
            notes: newLostBedCancellation.cancellationNotes,
          })
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(201, newLostBedCancellation)

        const result = await lostBedClient.cancel('premisesId', 'bedspaceId', 'lostBedId', newLostBedCancellation)
        expect(result).toEqual(newLostBedCancellation)
        expect(nock.isDone()).toBeTruthy()
      })
    })
  })
})
