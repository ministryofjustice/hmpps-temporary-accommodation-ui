import type { Request } from 'express'
import type { Session, SessionData } from 'express-session'
import type { TasklistPage } from 'approved-premises'

import type { RestClientBuilder, ApplicationClient } from '../data'
import { UnknownPageError, ValidationError } from '../utils/errors'
import type { PersonService } from './index'

import pages from '../form-pages/apply'

export type DataServices = {
  personService: PersonService
}

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(token: string): Promise<string> {
    const applicationClient = this.applicationClientFactory(token)

    const uuid = await applicationClient.create()

    return uuid
  }

  getCurrentPage(request: Request, userInput?: Record<string, unknown>): TasklistPage {
    if (!request.params.task) {
      throw new UnknownPageError()
    }

    const pageList = pages[request.params.task]

    request.params.page = request.params.page || Object.keys(pageList)[0]

    const Page = pageList[request.params.page]

    if (!Page) {
      throw new UnknownPageError()
    }

    const body = this.getBody(request, userInput)

    return new Page(body)
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

  private getBody(request: Request, userInput: Record<string, unknown>) {
    if (userInput && Object.keys(userInput).length) {
      return userInput
    }
    if (Object.keys(request.body).length) {
      return request.body
    }
    return this.getSessionData(request)
  }

  private getSessionData(request: Request) {
    const data = this.fetchOrInitializeSessionData(request.session, request.params.task, request.params.id)

    return data.application[request.params.id][request.params.task][request.params.page] || {}
  }
}
