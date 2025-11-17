import { faker } from '@faker-js/faker/.'
import paths from '../paths/api'
import {
  cas3VoidBedspaceCancellationFactory,
  cas3VoidBedspaceFactory,
  cas3VoidBedspaceRequestFactory,
} from '../testutils/factories'
import LostBedClient from './lostBedClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'

jest.mock('../config', () => ({
  ...jest.requireActual('../config').default,
  flags: {
    enableCas3v2Api: true,
  },
}))

describeClient('LostBedClient', provider => {
  let lostBedClient: LostBedClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    lostBedClient = new LostBedClient(callConfig)
  })

  describe('create', () => {
    it('should create a lostBed', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = cas3VoidBedspaceFactory.build()
      const newLostBed = cas3VoidBedspaceRequestFactory.build()

      await provider.addInteraction({
        state: 'Lost bed can be created',
        uponReceiving: 'a request to create a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.voidBedspaces.create({ premisesId, bedspaceId: lostBed.id }),
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

      const result = await lostBedClient.create(premisesId, lostBed.id, newLostBed)
      expect(result).toEqual(lostBed)
    })
  })

  describe('find', () => {
    it('should return the lost bed that has been requested', async () => {
      const premisesId = faker.string.uuid()
      const bedspaceId = faker.string.uuid()
      const lostBed = cas3VoidBedspaceFactory.build()

      await provider.addInteraction({
        state: 'Lost bed exists',
        uponReceiving: 'a request for a lost bed',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.voidBedspaces.show({ premisesId, bedspaceId, voidBedspaceId: lostBed.id }),
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

      const result = await lostBedClient.find(premisesId, bedspaceId, lostBed.id)
      expect(result).toEqual(lostBed)
    })
  })

  describe('allLostBedsForPremisesId', () => {
    it('should return all lost beds for a given premises ID', async () => {
      const premisesId = faker.string.uuid()
      const lostBeds = cas3VoidBedspaceFactory.buildList(5)

      await provider.addInteraction({
        state: 'Lost beds exist for premises',
        uponReceiving: 'a request for all lost beds for a premises',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.voidBedspaces.index({ premisesId }),
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
      const lostBed = cas3VoidBedspaceFactory.build()
      const payload = cas3VoidBedspaceRequestFactory.build(lostBed)

      await provider.addInteraction({
        state: 'Lost bed can be updated',
        uponReceiving: 'a request to update a lost bed',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.voidBedspaces.update({
            premisesId,
            bedspaceId: lostBed.bedspaceId,
            voidBedspaceId: lostBed.id,
          }),
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

      const result = await lostBedClient.update(premisesId, lostBed.bedspaceId, lostBed.id, payload)
      expect(result).toEqual(lostBed)
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const premisesId = faker.string.uuid()
      const lostBed = cas3VoidBedspaceFactory.build()
      const newLostBedCancellation = cas3VoidBedspaceCancellationFactory.build()

      await provider.addInteraction({
        state: 'Lost bed can be cancelled',
        uponReceiving: 'a request to cancel a lost bed',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.voidBedspaces.cancel({
            premisesId,
            bedspaceId: lostBed.bedspaceId,
            voidBedspaceId: lostBed.id,
          }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newLostBedCancellation,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: newLostBedCancellation,
        },
      })

      const result = await lostBedClient.cancel(premisesId, lostBed.bedspaceId, lostBed.id, newLostBedCancellation)
      expect(result).toEqual(newLostBedCancellation)
    })
  })
})
