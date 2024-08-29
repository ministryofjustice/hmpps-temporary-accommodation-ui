import type { TemporaryAccommodationUser as User } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class UserClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getActingUser() {
    return this.restClient.get<User>({ path: paths.users.actingUser.profile({}) })
  }

  async getUserById(id: string) {
    return this.restClient.get<User>({ path: paths.users.actingUser.show({ id }) })
  }
}
