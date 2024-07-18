import { TemporaryAccommodationUser as User } from '../@types/shared'
import { RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { convertToTitleCase } from '../utils/utils'

export type UserDetails = User & {
  displayName: string
}

export default class UserService {
  constructor(private readonly userClientFactory: RestClientBuilder<UserClient>) {}

  async getActingUser(callConfig: CallConfig): Promise<UserDetails> {
    const client = this.userClientFactory(callConfig)

    const { id } = await client.getActingUser()
    const communityAccommodationUser = await client.getUserById(id)

    return {
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
    }
  }
}
