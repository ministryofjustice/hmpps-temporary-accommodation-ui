import { faker } from '@faker-js/faker'
import BedspaceClient from './bedspaceClient'
import { CallConfig } from './restClient'
import {
  bedspaceSearchApiParametersFactory,
  bedspaceSearchResultsFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewBedspaceFactory,
  cas3UpdateBedspaceFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('BedspaceClient - ENABLE_CAS3V2_API flag off', provider => {
  let bedspaceClient: BedspaceClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    bedspaceClient = new BedspaceClient(callConfig)
  })

  describe('search', () => {
    it('returns search results', async () => {
      const results = bedspaceSearchResultsFactory.build()
      const payload = bedspaceSearchApiParametersFactory.build()

      await provider.addInteraction({
        state: 'Bedspace search results exist',
        uponReceiving: 'a request for bedspace search results',
        withRequest: {
          method: 'POST',
          path: paths.cas3.bedspaces.search({}),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: results,
        },
      })

      const result = await bedspaceClient.search(payload)
      expect(result).toEqual(results)
    })
  })

  describe('find', () => {
    it('should return bedspace', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const premisesId = faker.string.uuid()
      const bedspaceId = bedspace.id

      await provider.addInteraction({
        state: 'Bedspace exists',
        uponReceiving: 'a request for a bedspace',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.bedspaces.show({ premisesId, bedspaceId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspace,
        },
      })

      const output = await bedspaceClient.find(premisesId, bedspaceId)
      expect(output).toEqual(bedspace)
    })
  })

  describe('create', () => {
    it('should return the bedspace that has been created', async () => {
      const premisesId = faker.string.uuid()
      const bedspace = cas3BedspaceFactory.build()
      const payload = cas3NewBedspaceFactory.build({
        reference: bedspace.reference,
        notes: bedspace.notes,
      })

      await provider.addInteraction({
        state: 'Bedspace can be created',
        uponReceiving: 'a request to create a bedspace',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.bedspaces.create({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspace,
        },
      })

      const output = await bedspaceClient.create(premisesId, payload)
      expect(output).toEqual(bedspace)
    })
  })

  describe('get', () => {
    it('should return the bedspaces for a premises', async () => {
      const premisesId = faker.string.uuid()
      const bedspaces = cas3BedspacesFactory.build()

      await provider.addInteraction({
        state: 'Bedspaces exist for premises',
        uponReceiving: 'a request for all bedspaces for a premises',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.bedspaces.get({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspaces,
        },
      })

      const output = await bedspaceClient.get(premisesId)
      expect(output).toEqual(bedspaces)
    })
  })

  describe('update', () => {
    it('should return the bedspace that has been updated', async () => {
      const premisesId = faker.string.uuid()
      const bedspace = cas3BedspaceFactory.build()
      const bedspaceId = bedspace.id
      const payload = cas3UpdateBedspaceFactory.build({
        reference: bedspace.reference,
        notes: bedspace.notes,
        characteristicIds: bedspace.bedspaceCharacteristics.map(ch => ch.id),
      })

      await provider.addInteraction({
        state: 'Bedspace can be updated',
        uponReceiving: 'a request to update a bedspace',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.bedspaces.update({ premisesId, bedspaceId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspace,
        },
      })

      const result = await bedspaceClient.update(premisesId, bedspaceId, payload)
      expect(result).toEqual(bedspace)
    })
  })

  describe('cancelArchive', () => {
    it('should return the bedspace after cancelling the archive', async () => {
      const premisesId = faker.string.uuid()
      const bedspace = cas3BedspaceFactory.build()
      const bedspaceId = bedspace.id

      await provider.addInteraction({
        state: 'Bedspace archive can be cancelled',
        uponReceiving: 'a request to cancel archive of a bedspace',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspace,
        },
      })

      const result = await bedspaceClient.cancelArchive(premisesId, bedspaceId)
      expect(result).toEqual(bedspace)
    })
  })
})
