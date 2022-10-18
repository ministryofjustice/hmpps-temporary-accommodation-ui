import type { LocalAuthority } from '@approved-premises/ui'
import RestClient from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/temporary-accommodation/api'

export default class LocalAuthorityClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('localAuthorityClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<LocalAuthority>> {
    return (await this.restClient.get({ path: paths.localAuthorities.index({}) })) as Array<LocalAuthority>
  }
}
