import type { Request } from 'express'
import type { Session, SessionData } from 'express-session'
import type { TasklistPage } from 'approved-premises'

import type { RestClientBuilder, ApplicationClient } from '../data'
import { UnknownPageError, ValidationError } from '../utils/errors'

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

  save(page: TasklistPage, request: Request) {
    const errors = page.errors ? page.errors() : []
    if (errors.length) {
      throw new ValidationError(errors)
    } else {
      request.session = this.fetchOrInitializeSessionData(request.session, request.params.task, request.params.id)

      request.session.application[request.params.id][request.params.task][request.params.page] = page.body
    }
  }

  private fetchOrInitializeSessionData(sessionData: Session & Partial<SessionData>, task: string, id: string) {
    sessionData.application = sessionData.application || {}
    sessionData.application[id] = sessionData.application[id] || {}
    sessionData.application[id][task] = sessionData.application[id][task] || {}

    return sessionData
  }
}
