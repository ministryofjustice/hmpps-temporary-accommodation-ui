import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CallConfig } from '../data/restClient'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(callConfig: CallConfig): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(callConfig.token)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }
}
