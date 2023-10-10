import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { userFactory } from '../testutils/factories'
import UserService from './userService'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/userClient')

const callConfig = { token: 'some-token' } as CallConfig

describe('User service', () => {
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  const userClient = new UserClient(null) as jest.Mocked<UserClient>

  const userClientFactory = jest.fn()

  const userService = new UserService(hmppsAuthClient, userClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    userClientFactory.mockReturnValue(userClient)
  })

  describe('getActingUser', () => {
    it('gets the acting user, collating results from the Community Accommodation API and the HMPPS Auth API', async () => {
      const communityAccommodationUser = userFactory.build()
      const hmppsAuthUser = { name: 'john smith' } as User

      userClient.getActingUser.mockResolvedValue(communityAccommodationUser)
      userClient.getUserById.mockResolvedValue(communityAccommodationUser)
      hmppsAuthClient.getActingUser.mockResolvedValue(hmppsAuthUser)

      const result = await userService.getActingUser(callConfig)

      expect(result).toEqual({
        ...communityAccommodationUser,
        ...hmppsAuthUser,
        displayName: 'John Smith',
      })

      expect(userClientFactory).toHaveBeenCalledWith(callConfig)
      expect(userClient.getActingUser).toHaveBeenCalledWith()
    })

    it('propagates errors from the HMPPS Auth API', async () => {
      hmppsAuthClient.getActingUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getActingUser(callConfig)).rejects.toEqual(new Error('some error'))
    })

    it('propagates errors from the Community Accommodation API', async () => {
      userClient.getActingUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getActingUser(callConfig)).rejects.toEqual(new Error('some error'))
    })
  })
})
