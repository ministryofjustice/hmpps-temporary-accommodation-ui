import { faker } from '@faker-js/faker/.'
import paths from '../paths/api'
import {
  lostBedCancellationFactory,
  lostBedFactory,
  newLostBedCancellationFactory,
  newLostBedFactory,
  updateLostBedFactory,
} from '../testutils/factories'
import LostBedClient from './lostBedClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'

describeClient('LostBedClient', provider => {
  let lostBedClient: LostBedClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    lostBedClient = new LostBedClient(callConfig)
  })

  describe('create', () => {
    it('should create a lostBed', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = lostBedFactory.build()
      const newLostBed = newLostBedFactory.build()

      await provider.addInteraction({
        state: 'Lost bed can be created',
        uponReceiving: 'a request to create a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.premises.lostBeds.create({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newLostBed,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: lostBed,
        },
      })

      const result = await lostBedClient.create(premisesId, newLostBed)
      expect(result).toEqual(lostBed)
    })
  })

  describe('find', () => {
    it('should return the lost bed that has been requested', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = lostBedFactory.build()

      await provider.addInteraction({
        state: 'Lost bed exists',
        uponReceiving: 'a request for a lost bed',
        withRequest: {
          method: 'GET',
          path: paths.premises.lostBeds.show({ premisesId, lostBedId: lostBed.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: lostBed,
        },
      })

      const result = await lostBedClient.find(premisesId, lostBed.id)
      expect(result).toEqual(lostBed)
    })
  })

  describe('allLostBedsForPremisesId', () => {
    it('should return all lost beds for a given premises ID', async () => {
      const premisesId = faker.string.uuid()
      const lostBeds = lostBedFactory.buildList(5)

      await provider.addInteraction({
        state: 'Lost beds exist for premises',
        uponReceiving: 'a request for all lost beds for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.lostBeds.index({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: lostBeds,
        },
      })

      const result = await lostBedClient.allLostBedsForPremisesId(premisesId)
      expect(result).toEqual(lostBeds)
    })
  })

  describe('update', () => {
    it('updates and returns the given lost bed', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = lostBedFactory.build()
      const payload = updateLostBedFactory.build({
        ...lostBed,
        reason: lostBed.reason.id,
      })

      await provider.addInteraction({
        state: 'Lost bed can be updated',
        uponReceiving: 'a request to update a lost bed',
        withRequest: {
          method: 'PUT',
          path: paths.premises.lostBeds.update({ premisesId, lostBedId: lostBed.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: lostBed,
        },
      })

      const result = await lostBedClient.update(premisesId, lostBed.id, payload)
      expect(result).toEqual(lostBed)
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = lostBedFactory.build()
      const newLostBedCancellation = newLostBedCancellationFactory.build()
      const cancellation = lostBedCancellationFactory.build({ id: lostBed.id })

      await provider.addInteraction({
        state: 'Lost bed can be cancelled',
        uponReceiving: 'a request to cancel a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.premises.lostBeds.cancel({ premisesId, lostBedId: lostBed.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newLostBedCancellation,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: cancellation,
        },
      })

      const result = await lostBedClient.cancel(premisesId, lostBed.id, newLostBedCancellation)
      expect(result).toEqual(cancellation)
    })
  })
})
