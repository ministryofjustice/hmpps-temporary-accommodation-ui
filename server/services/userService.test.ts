import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { CallConfig } from '../data/restClient'

jest.mock('../data/hmppsAuthClient')

const callConfig = { token: 'some-token' } as CallConfig

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(callConfig)

      expect(result.displayName).toEqual('John Smith')
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(callConfig)).rejects.toEqual(new Error('some error'))
    })
  })
})
