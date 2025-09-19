import PremisesClient from '../data/premisesClient'
import { CallConfig } from '../data/restClient'
import { premisesFactory, probationRegionFactory } from '../testutils/factories'
import PremisesService from './premisesService'

jest.mock('../data/premisesClient')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>

  const premisesClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory)

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
  })

  describe('getPremises', () => {
    it('returns the premises for the given premises ID', async () => {
      const premises = premisesFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getPremises(callConfig, premises.id)

      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)
    })
  })
})
