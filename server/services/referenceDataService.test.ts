import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import ReferenceDataService from './referenceDataService'
import { localAuthorityFactory, probationRegionFactory, referenceDataFactory } from '../testutils/factories'

jest.mock('../data/referenceDataClient')

describe('ReferenceDataService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const referenceDataClientFactory = jest.fn()
  const referenceDataService = new ReferenceDataService(referenceDataClientFactory)
  const probationRegion = probationRegionFactory.build()
  const callConfig = { token: 'some-token', probationRegion } as CallConfig

  beforeEach(() => {
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getLocalAuthorities', () => {
    it('returns a list of local authorities sorted by name', async () => {
      const localAuthority1 = localAuthorityFactory.build({ name: 'XYZ' })
      const localAuthority2 = localAuthorityFactory.build({ name: 'HIJ' })
      const localAuthority3 = localAuthorityFactory.build({ name: 'ABC' })

      referenceDataClient.getReferenceData.mockImplementation(async () => {
        return [localAuthority1, localAuthority2, localAuthority3]
      })

      const result = await referenceDataService.getLocalAuthorities(callConfig)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('local-authority-areas')
      expect(result).toEqual([localAuthority3, localAuthority2, localAuthority1])
    })
  })

  describe('getRegionPdus', () => {
    it('returns a list of PDUs from the current region sorted by name', async () => {
      const pdu1 = referenceDataFactory.pdu().build({ name: 'XYZ' })
      const pdu2 = referenceDataFactory.pdu().build({ name: 'ABC' })
      const pdu3 = referenceDataFactory.pdu().build({ name: 'FOO' })

      referenceDataClient.getReferenceData.mockImplementation(async () => {
        return [pdu1, pdu2, pdu3]
      })

      const result = await referenceDataService.getRegionPdus(callConfig)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: probationRegion.id,
      })
      expect(result).toEqual([pdu2, pdu3, pdu1])
    })
  })
})
