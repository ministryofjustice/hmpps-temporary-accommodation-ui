import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { userFactory } from '../testutils/factories'
import UserService from './userService'
import { convertToTitleCase } from '../utils/utils'

jest.mock('../data/userClient')

const callConfig = { token: 'some-token' } as CallConfig

describe('User service', () => {
  const userClient = new UserClient(null) as jest.Mocked<UserClient>

  const userClientFactory = jest.fn()

  const userService = new UserService(userClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    userClientFactory.mockReturnValue(userClient)
  })

  describe('getActingUser', () => {
    it('gets the acting user from the Community Accommodation API', async () => {
      const communityAccommodationUser = userFactory.build()

      userClient.getActingUser.mockResolvedValue(communityAccommodationUser)
      userClient.getUserById.mockResolvedValue(communityAccommodationUser)

      const result = await userService.getActingUser(callConfig)

      expect(result).toEqual({
        name: communityAccommodationUser.name,
        displayName: convertToTitleCase(communityAccommodationUser.name),
        id: communityAccommodationUser.id,
        roles: communityAccommodationUser.roles,
        service: communityAccommodationUser.service,
        region: communityAccommodationUser.region,
        deliusUsername: communityAccommodationUser.deliusUsername,
      })

      expect(userClientFactory).toHaveBeenCalledWith(callConfig)
      expect(userClient.getActingUser).toHaveBeenCalledWith()
    })

    it('propagates errors from the Community Accommodation API', async () => {
      userClient.getActingUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getActingUser(callConfig)).rejects.toEqual(new Error('some error'))
    })
  })
})
