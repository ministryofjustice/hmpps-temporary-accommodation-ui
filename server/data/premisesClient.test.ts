import PremisesClient from './premisesClient'
import { CallConfig } from './restClient'
import {
  cas3ArchivePremisesFactory,
  cas3BedspacesReferenceFactory,
  cas3NewPremisesFactory,
  cas3PremisesBedspaceTotalsFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UnarchivePremisesFactory,
  cas3UpdatePremisesFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('PremisesClient', provider => {
  let premisesClient: PremisesClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    premisesClient = new PremisesClient(callConfig)
  })

  describe('search', () => {
    it.each([
      [cas3PremisesSearchResultsFactory.build({ results: cas3PremisesSearchResultFactory.buildList(5) })],
      [cas3PremisesSearchResultsFactory.build({ results: cas3PremisesSearchResultFactory.buildList(0) })],
    ])('should get premises search results', async searchResults => {
      await provider.addInteraction({
        state: 'Premises search results exist',
        uponReceiving: 'a request for premises search results',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.search({}),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          query: {
            postcodeOrAddress: 'NE1 1AB',
            premisesStatus: 'online',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: searchResults,
        },
      })

      const output = await premisesClient.search('NE1 1AB', 'online')
      expect(output).toEqual(searchResults)
    })
  })

  describe('find', () => {
    it('should get a single premises by id', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id

      await provider.addInteraction({
        state: 'Premises exists',
        uponReceiving: 'a request for a single premises',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.show({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const output = await premisesClient.find(premisesId)
      expect(output).toEqual(premises)
    })
  })

  describe('create', () => {
    it('should return the premises that has been created', async () => {
      const premises = cas3PremisesFactory.build()
      const payload = cas3NewPremisesFactory.build({ ...premises })

      await provider.addInteraction({
        state: 'Premises can be created',
        uponReceiving: 'a request to create a premises',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.create({}),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.create(payload)
      expect(result).toEqual(premises)
    })
  })

  describe('update', () => {
    it('should return the premises that has been updated', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id
      const payload = cas3UpdatePremisesFactory.build({ ...premises })

      await provider.addInteraction({
        state: 'Premises can be updated',
        uponReceiving: 'a request to update a premises',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.update({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.update(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })

  describe('canArchive', () => {
    it('should return the bedspace references that are preventing a premises from being archived', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id
      const bedspacesReference = cas3BedspacesReferenceFactory.build()

      await provider.addInteraction({
        state: 'Bedspaces reference exists',
        uponReceiving: 'a request for bedspaces reference',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.canArchive({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: bedspacesReference,
        },
      })

      const result = await premisesClient.canArchive(premisesId)
      expect(result).toEqual(bedspacesReference)
    })
  })

  describe('archive', () => {
    it('should return the premises that has been archived', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id
      const payload = cas3ArchivePremisesFactory.build()

      await provider.addInteraction({
        state: 'Premises can be archived',
        uponReceiving: 'a request to archive a premises',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.archive({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.archive(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })

  describe('unarchive', () => {
    it('should return the premises that has been unarchived', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id
      const payload = cas3UnarchivePremisesFactory.build()

      await provider.addInteraction({
        state: 'Premises can be unarchived',
        uponReceiving: 'a request to unarchive a premises',
        withRequest: {
          method: 'POST',
          path: paths.cas3.premises.unarchive({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: payload,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.unarchive(premisesId, payload)
      expect(result).toEqual(premises)
    })
  })

  describe('cancelArchive', () => {
    it('should return the premises that has been archive cancelled', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id

      await provider.addInteraction({
        state: 'Premises archive can be cancelled',
        uponReceiving: 'a request to cancel archive of a premises',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.cancelArchive({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.cancelArchive(premisesId)
      expect(result).toEqual(premises)
    })
  })

  describe('cancelUnarchive', () => {
    it('should return the premises that has been unarchive cancelled', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id

      await provider.addInteraction({
        state: 'Premises unarchive can be cancelled',
        uponReceiving: 'a request to cancel unarchive of a premises',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.premises.cancelUnarchive({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: premises,
        },
      })

      const result = await premisesClient.cancelUnarchive(premisesId)
      expect(result).toEqual(premises)
    })
  })

  describe('totals', () => {
    it('should return the bedspace totals for a premises', async () => {
      const premises = cas3PremisesFactory.build()
      const premisesId = premises.id
      const totals = cas3PremisesBedspaceTotalsFactory.build()

      await provider.addInteraction({
        state: 'Bedspace totals exist',
        uponReceiving: 'a request for bedspace totals',
        withRequest: {
          method: 'GET',
          path: paths.cas3.premises.totals({ premisesId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: totals,
        },
      })

      const result = await premisesClient.totals(premisesId)
      expect(result).toEqual(totals)
    })
  })
})
