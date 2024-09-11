import { PrimaryNavigationItem } from '@approved-premises/ui'
import { ProfileResponse, TemporaryAccommodationUser, TemporaryAccommodationUser as User } from '../@types/shared'
import { RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { convertToTitleCase } from '../utils/utils'
import paths from '../paths/temporary-accommodation/manage'

export type UserDetails = User & {
  displayName: string
  primaryNavigationList?: Array<PrimaryNavigationItem>
}

type TemporaryAccommodationProfileResponse = ProfileResponse & { user: TemporaryAccommodationUser }

export class DeliusAccountMissingStaffDetailsError extends Error {}

export default class UserService {
  constructor(private readonly userClientFactory: RestClientBuilder<UserClient>) {}

  async getActingUser(callConfig: CallConfig): Promise<UserDetails> {
    const client = this.userClientFactory(callConfig)

    const profile = (await client.getUserProfile()) as TemporaryAccommodationProfileResponse

    if (profile.loadError === 'staff_record_not_found') {
      throw new DeliusAccountMissingStaffDetailsError('Delius account missing staff details')
    }

    const { isActive, ...user } = profile.user

    return {
      ...user,
      displayName: convertToTitleCase(profile.user.name),
    }
  }

  getActingUserPrimaryNavigationList(actingUser: User, currentPage: string): Array<PrimaryNavigationItem> {
    if (actingUser.roles?.includes('assessor')) {
      const navList: Array<PrimaryNavigationItem> = [
        { href: paths.bookings.index({}), text: 'Bookings' },
        { href: paths.premises.index({}), text: 'Manage properties' },
        { href: paths.assessments.index({}), text: 'Referrals' },
        { href: paths.bedspaces.search({}), text: 'Search bedspaces' },
        { href: paths.reports.index({}), text: 'Reports' },
      ]

      return navList.map(item => ({
        ...item,
        active: currentPage.includes(item.href),
      }))
    }

    // If the user is not am assessor, return an empty list.
    return []
  }
}
