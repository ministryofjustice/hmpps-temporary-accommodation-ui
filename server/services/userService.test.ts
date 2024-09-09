import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { userFactory, userProfileFactory } from '../testutils/factories'
import UserService, { DeliusAccountMissingStaffDetailsError } from './userService'
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
      const userProfile = userProfileFactory.build({ user: communityAccommodationUser })

      userClient.getUserProfile.mockResolvedValue(userProfile)

      const result = await userService.getActingUser(callConfig)

      expect(result).toEqual({
        name: communityAccommodationUser.name,
        displayName: convertToTitleCase(communityAccommodationUser.name),
        email: communityAccommodationUser.email,
        telephoneNumber: communityAccommodationUser.telephoneNumber,
        id: communityAccommodationUser.id,
        roles: communityAccommodationUser.roles,
        service: communityAccommodationUser.service,
        region: communityAccommodationUser.region,
        probationDeliveryUnit: communityAccommodationUser.probationDeliveryUnit,
        deliusUsername: communityAccommodationUser.deliusUsername,
      })

      expect(userClientFactory).toHaveBeenCalledWith(callConfig)
      expect(userClient.getUserProfile).toHaveBeenCalledWith()
    })

    it('throws a DeliusAccountMissingStaffDetailsError if the user staff details are not found', async () => {
      const userProfile = userProfileFactory.build({ loadError: 'staff_record_not_found', user: undefined })

      userClient.getUserProfile.mockResolvedValue(userProfile)

      await expect(userService.getActingUser(callConfig)).rejects.toEqual(
        new DeliusAccountMissingStaffDetailsError('Delius account missing staff details'),
      )
    })

    it('propagates errors from the API', async () => {
      userClient.getUserProfile.mockRejectedValue(new Error('some error'))

      await expect(userService.getActingUser(callConfig)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getActingUserPrimaryNavigationList', () => {
    it('returns an empty list by default', () => {
      expect(userService.getActingUserPrimaryNavigationList()).toEqual([])
    })
  })
})
