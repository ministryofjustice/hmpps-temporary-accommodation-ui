import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import ReferenceDataService from './referenceDataService'
import { localAuthorityFactory } from '../testutils/factories'

jest.mock('../data/referenceDataClient')

describe('ReferenceDataService', () => {
  describe('getLocalAuthorities', () => {
    it('returns a list of local authorities sorted by name', async () => {
      const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
      const referenceDataClientFactory = jest.fn()
      const referenceDataService = new ReferenceDataService(referenceDataClientFactory)

      referenceDataClientFactory.mockReturnValue(referenceDataClient)

      const callConfig = { token: 'some-token' } as CallConfig

      const localAuthority1 = localAuthorityFactory.build({ name: 'XYZ' })
      const localAuthority2 = localAuthorityFactory.build({ name: 'HIJ' })
      const localAuthority3 = localAuthorityFactory.build({ name: 'ABC' })

      referenceDataClient.getReferenceData.mockImplementation(async () => {
        return [localAuthority1, localAuthority2, localAuthority3]
      })

      const result = await referenceDataService.getLocalAuthorities(callConfig)

      expect(result).toEqual([localAuthority3, localAuthority2, localAuthority1])
    })
  })
})
