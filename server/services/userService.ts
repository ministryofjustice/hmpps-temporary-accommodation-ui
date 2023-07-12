import { TemporaryAccommodationUser as User } from '../@types/shared'
import { RestClientBuilder } from '../data'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CallConfig } from '../data/restClient'
import UserClient from '../data/userClient'
import { convertToTitleCase } from '../utils/utils'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
  ) {}

  async getUser(callConfig: CallConfig): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(callConfig)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getActingUser(callConfig: CallConfig): Promise<User> {
    const userClient = this.userClientFactory(callConfig)
    const user = await userClient.getActingUser()

    return user
  }
}
