import PremisesClient from '../data/premisesClient'
import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import {
  characteristicFactory,
  localAuthorityFactory,
  pduFactory,
  premisesFactory,
  probationRegionFactory,
} from '../testutils/factories'
import { filterCharacteristics } from '../utils/characteristicUtils'
import PremisesService from './premisesService'

jest.mock('../data/premisesClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/premisesUtils')
jest.mock('../utils/viewUtils')
jest.mock('../utils/characteristicUtils')
jest.mock('../utils/placeUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const premisesClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory, referenceDataClientFactory)

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getReferenceData', () => {
    it('returns sorted premises reference data', async () => {
      const localAuthority1 = localAuthorityFactory.build({ name: 'ABC' })
      const localAuthority2 = localAuthorityFactory.build({ name: 'HIJ' })
      const localAuthority3 = localAuthorityFactory.build({ name: 'XYZ' })

      const premisesCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'premises' })
      const premisesCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'premises' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const roomCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'room' })

      const probationRegion1 = probationRegionFactory.build({ name: 'EFG' })
      const probationRegion2 = probationRegionFactory.build({ name: 'PQR' })
      const probationRegion3 = probationRegionFactory.build({ name: 'UVW' })

      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'local-authority-areas') {
          return [localAuthority3, localAuthority1, localAuthority2]
        }
        if (objectType === 'characteristics') {
          return [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, roomCharacteristic]
        }
        if (objectType === 'probation-regions') {
          return [probationRegion2, probationRegion1, probationRegion3]
        }
        return [pdu2, pdu3, pdu1]
      })
      ;(filterCharacteristics as jest.MockedFunction<typeof filterCharacteristics>).mockReturnValue([
        genericCharacteristic,
        premisesCharacteristic2,
        premisesCharacteristic1,
      ])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({
        localAuthorities: [localAuthority1, localAuthority2, localAuthority3],
        characteristics: [premisesCharacteristic1, premisesCharacteristic2, genericCharacteristic],
        probationRegions: [probationRegion1, probationRegion2, probationRegion3],
        pdus: [pdu1, pdu2, pdu3],
      })

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('local-authority-areas')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('characteristics')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, roomCharacteristic],
        'premises',
      )
    })
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
