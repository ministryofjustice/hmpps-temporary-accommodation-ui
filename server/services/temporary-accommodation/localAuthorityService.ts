import type { LocalAuthorityArea } from '@approved-premises/api'
import { RestClientBuilder } from '../../data'
import LocalAuthorityClient from '../../data/temporary-accommodation/localAuthorityClient'

export default class LocalAuthorityService {
  constructor(private readonly localAuthorityClientFactory: RestClientBuilder<LocalAuthorityClient>) {}

  async getLocalAuthorities(token: string): Promise<Array<LocalAuthorityArea>> {
    const localAuthorityClient = this.localAuthorityClientFactory(token)

    return [...(await localAuthorityClient.all())].sort((a, b) => a.name.localeCompare(b.name))
  }
}
