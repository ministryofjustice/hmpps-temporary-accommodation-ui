import { TemporaryAccommodationUser as User } from '../@types/shared'
import { RestClientBuilder } from '../data'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { convertToTitleCase } from '../utils/utils'

export type UserDetails = User & {
  name: string
  displayName: string
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
  ) {}

  async getActingUser(callConfig: CallConfig): Promise<UserDetails> {
    const hmppsAuthUser = await this.hmppsAuthClient.getActingUser(callConfig)

    const client = this.userClientFactory(callConfig)

    const { id } = await client.getActingUser()
    const communityAccommodationUser = await client.getUserById(id)

    return {
      ...hmppsAuthUser,
      displayName: convertToTitleCase(hmppsAuthUser.name),
      id: communityAccommodationUser.id,
      roles: communityAccommodationUser.roles,
      service: communityAccommodationUser.service,
      region: communityAccommodationUser.region,
      deliusUsername: communityAccommodationUser.deliusUsername,
    }
  }
}
