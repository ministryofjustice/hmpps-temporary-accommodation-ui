import type { TemporaryAccommodationUserLocal as User } from '@approved-premises/ui'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

import { RegionConfigData } from '../@types/ui'
import regions from '../etc/regions.json'

// Allows the ui to differentiate based on the region of the user
// Ideally these should be send by the API as one could forsee a future scenario where not just
// ui differentates but calls back to the API itself.
// Placing it here where it stores into JWT allows for the API to provide this in the future.
const attachLocalRegionConfig = (user: User) => {
  const regionConfig = regions.find(region => region.id === user.region.id) as undefined
  if (regionConfig) {
    user.region.config = (regionConfig as RegionConfigData).config
  }
}

export default class UserClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async getActingUser(): Promise<User> {
    const user = (await this.restClient.get({ path: paths.users.actingUser.profile({}) })) as User
    attachLocalRegionConfig(user)
    return user
  }

  async getUserById(id: string): Promise<User> {
    const user = (await this.restClient.get({ path: paths.users.actingUser.show({ id }) })) as User
    attachLocalRegionConfig(user)
    return user
  }
}
