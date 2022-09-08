import type { Request } from 'express'
import type { RestClientBuilder, ApplicationClient } from '../data'
export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(token: string): Promise<string> {
    const applicationClient = this.applicationClientFactory(token)

    const uuid = await applicationClient.create()

    return uuid
  }
}
