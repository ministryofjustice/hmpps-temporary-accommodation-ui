import { ProfileResponse, TemporaryAccommodationUser, TemporaryAccommodationUser as User } from '../@types/shared'
import { RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { convertToTitleCase } from '../utils/utils'

export type UserDetails = User & {
  displayName: string
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

  getActingUserPrimaryNavigationList(): Array{
    return []
  }
}
