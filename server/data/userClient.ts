import type { User } from '@approved-premises/api'
import { Request } from 'express'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class UserClient {
  restClient: RestClient

  constructor(req: Request) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, req)
  }

  async getActingUser(): Promise<User> {
    return (await this.restClient.get({ path: paths.users.actingUser.show({}) })) as User
  }
}
