import { Request } from 'express'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(req: Request): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(req)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }
}
