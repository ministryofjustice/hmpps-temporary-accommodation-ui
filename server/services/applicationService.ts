import type { Request } from 'express'
import type { TasklistPage } from 'approved-premises'

import type { RestClientBuilder, ApplicationClient } from '../data'
import { UnknownPageError } from '../utils/errors'

import pages from '../form-pages/apply'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(token: string): Promise<string> {
    const applicationClient = this.applicationClientFactory(token)

    const uuid = await applicationClient.create()

    return uuid
  }

  getCurrentPage(request: Request): TasklistPage {
    if (!request.params.task) {
      throw new UnknownPageError()
    }
    const pageList = pages[request.params.task]
    const Page = request.params.page ? pageList[request.params.page] : Object.values(pageList)[0]

    if (!Page) {
      throw new UnknownPageError()
    }
    return new Page(request.body)
  }
}
