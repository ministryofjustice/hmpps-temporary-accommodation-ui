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
})
