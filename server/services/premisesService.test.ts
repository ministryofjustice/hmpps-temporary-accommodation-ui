import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'

import premisesFactory from '../testutils/factories/premises'

jest.mock('../data/premisesClient')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  let service: PremisesService

  const premisesClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    service = new PremisesService(premisesClientFactory)
  })

  describe('tableRows', () => {
    it('returns a table view of the premises', async () => {
      const premises1 = premisesFactory.build({ name: 'XYZ' })
      const premises2 = premisesFactory.build({ name: 'ABC' })
      const premises3 = premisesFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]
      premisesClient.getAllPremises.mockResolvedValue(premises)

      const rows = await service.tableRows()

      expect(rows).toEqual([
        [
          {
            text: premises2.name,
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            html: `<a href="/premises/${premises2.id}">View<span class="govuk-visually-hidden">about ${premises2.name}</span></a>`,
          },
        ],
        [
          {
            text: premises3.name,
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            html: `<a href="/premises/${premises3.id}">View<span class="govuk-visually-hidden">about ${premises3.name}</span></a>`,
          },
        ],
        [
          {
            text: premises1.name,
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            html: `<a href="/premises/${premises1.id}">View<span class="govuk-visually-hidden">about ${premises1.name}</span></a>`,
          },
        ],
      ])
    })
  })

  describe('premisesSelectList', () => {
    it('returns the list mapped into the format required by the nunjucks macro and sorted alphabetically', async () => {
      const premisesA = premisesFactory.build({ name: 'a' })
      const premisesB = premisesFactory.build({ name: 'b' })
      const premisesC = premisesFactory.build({ name: 'c' })
      premisesClient.getAllPremises.mockResolvedValue([premisesC, premisesB, premisesA])

      const result = await service.getPremisesSelectList()

      expect(result).toEqual([
        { text: premisesA.name, value: premisesA.id },
        { text: premisesB.name, value: premisesB.id },
        { text: premisesC.name, value: premisesC.id },
      ])
    })
  })

  describe('getPremisesDetails', () => {
    it('returns a title and a summary list for a given Premises ID', async () => {
      const premises = premisesFactory.build({ name: 'Test', apCode: 'ABC', postcode: 'SW1A 1AA', bedCount: 50 })
      premisesClient.getPremises.mockResolvedValue(premises)

      const result = await service.getPremisesDetails(premises.id)

      expect(result).toEqual({
        name: 'Test',
        summaryList: {
          rows: [
            {
              key: { text: 'Code' },
              value: { text: 'ABC' },
            },
            {
              key: { text: 'Postcode' },
              value: { text: 'SW1A 1AA' },
            },
            {
              key: { text: 'Number of Beds' },
              value: { text: '50' },
            },
          ],
        },
      })

      expect(premisesClient.getPremises).toHaveBeenCalledWith(premises.id)
    })
  })
})
