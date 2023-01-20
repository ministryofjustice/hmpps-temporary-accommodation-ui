import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { createMockRequest } from '../testutils/createMockRequest'
import userFactory from '../testutils/factories/user'
import UserClient from '../data/userClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/userClient')

const request = createMockRequest()

describe('User service', () => {
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  const userClient = new UserClient(null) as jest.Mocked<UserClient>

  const userClientFactory = jest.fn()

  const userService = new UserService(hmppsAuthClient, userClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    userClientFactory.mockReturnValue(userClient)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(request)

      expect(result.displayName).toEqual('John Smith')
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(request)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getActingUser', () => {
    it('gets the acting user', async () => {
      const user = userFactory.build()
      userClient.getActingUser.mockResolvedValue(user)

      const result = await userService.getActingUser(request)

      expect(result).toEqual(user)

      expect(userClientFactory).toHaveBeenCalledWith(request)
      expect(userClient.getActingUser).toHaveBeenCalledWith()
    })
  })
})
