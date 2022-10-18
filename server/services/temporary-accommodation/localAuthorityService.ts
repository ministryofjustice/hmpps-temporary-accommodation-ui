import type { LocalAuthority } from '@approved-premises/ui'
import { RestClientBuilder } from '../../data'
import LocalAuthorityClient from '../../data/temporary-accommodation/localAuthorityClient'

export default class LocalAuthorityService {
  constructor(private readonly localAuthorityClientFactory: RestClientBuilder<LocalAuthorityClient>) {}

  async getLocalAuthorities(token: string): Promise<Array<LocalAuthority>> {
    const localAuthorityClient = this.localAuthorityClientFactory(token)

    return [...(await localAuthorityClient.all())].sort((a, b) => a.name.localeCompare(b.name))
  }
}
