import type { ProfileResponse } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class UserClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getUserProfile() {
    return this.restClient.get<ProfileResponse>({ path: paths.users.actingUser.profile({}) })
  }
}
