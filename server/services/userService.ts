import { Request } from 'express'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import UserClient from '../data/userClient'
import { User } from '../@types/shared'
import { RestClientBuilder } from '../data'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
  ) {}

  async getUser(req: Request): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(req)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getActingUser(req: Request): Promise<User> {
    const userClient = this.userClientFactory(req)
    const user = await userClient.getActingUser()

    return user
  }
}
