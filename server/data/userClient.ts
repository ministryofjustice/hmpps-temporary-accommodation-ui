import type { TemporaryAccommodationUser as User } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class UserClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getActingUser(): Promise<User> {
    return (await this.restClient.get({ path: paths.users.actingUser.profile({}) })) as User
  }

  async getUserById(id: string): Promise<User> {
    return (await this.restClient.get({ path: paths.users.actingUser.show({ id }) })) as User
  }
}
