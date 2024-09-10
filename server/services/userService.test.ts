import { PrimaryNavigationItem } from '@approved-premises/ui'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { userFactory, userProfileFactory } from '../testutils/factories'
import UserService, { DeliusAccountMissingStaffDetailsError } from './userService'
import { convertToTitleCase } from '../utils/utils'
import paths from '../paths/temporary-accommodation/manage'

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
    const communityAccommodationUser = userFactory.build()

    it('returns an empty list by default', () => {
      expect(userService.getActingUserPrimaryNavigationList(communityAccommodationUser, '')).toEqual([])
    })

    describe('when user is an assessor', () => {
      const assessorUser = userFactory.build({ roles: ['assessor'] })
      const navigationList: Array<PrimaryNavigationItem> = [
        { text: 'Bookings', href: paths.bookings.index({}), active: false },
        { text: 'Manage properties', href: paths.premises.index({}), active: false },
        { text: 'Referrals', href: paths.assessments.index({}), active: false },
        { text: 'Search bedspaces', href: paths.bedspaces.search({}), active: false },
        { text: 'Reports', href: paths.reports.index({}), active: false },
      ]

      it('returns a list of navigation items for the user', () => {
        const result = userService.getActingUserPrimaryNavigationList(assessorUser, '')
        expect(result).toEqual(navigationList)
      })

      describe('when a user is viewing a nav list item page', () => {
        it.each(navigationList)(`returns active when a user is viewing %p page with %p link`, ({ text, href }) => {
          const result = userService.getActingUserPrimaryNavigationList(assessorUser, href)

          result.forEach(item => {
            if (item.text === text) {
              expect(item).toHaveProperty('active', true)
            } else {
              expect(item).toHaveProperty('active', false)
            }
          })
        })
      })
    })
  })
})
