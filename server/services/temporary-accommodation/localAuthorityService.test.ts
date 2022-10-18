import localAuthorityFactory from '../../testutils/factories/localAuthority'
import LocalAuthorityClient from '../../data/temporary-accommodation/localAuthorityClient'
import LocalAuthorityService from './localAuthorityService'

jest.mock('../../data/temporary-accommodation/localAuthorityClient')

describe('LocalAuthorityService', () => {
  const localAuthorityClient = new LocalAuthorityClient(null) as jest.Mocked<LocalAuthorityClient>
  const localAuthorityClientFactory = jest.fn()

  const service = new LocalAuthorityService(localAuthorityClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    localAuthorityClientFactory.mockReturnValue(localAuthorityClient)
  })

  describe('getLocalAuthorities', () => {
    it('calls the all method and returns a sorted list of local authorities', async () => {
      const localAuthorities = [
        localAuthorityFactory.build({
          name: 'XYZ',
        }),
        localAuthorityFactory.build({
          name: 'ABC',
        }),
        localAuthorityFactory.build({
          name: 'RST',
        }),
      ]
      localAuthorityClient.all.mockResolvedValue(localAuthorities)

      const result = await service.getLocalAuthorities(token)

      expect(result).toEqual([localAuthorities[1], localAuthorities[2], localAuthorities[0]])

      expect(localAuthorityClientFactory).toHaveBeenCalledWith(token)
      expect(localAuthorityClient.all).toHaveBeenCalled()
    })
  })
})
