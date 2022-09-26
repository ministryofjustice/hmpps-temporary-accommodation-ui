import type { Request } from 'express'
import type { Session, SessionData } from 'express-session'
import type { Application, HtmlItem, TextItem } from 'approved-premises'

import type TasklistPage from '../form-pages/tasklistPage'
import type { RestClientBuilder, ApplicationClient } from '../data'
import { UnknownPageError, ValidationError } from '../utils/errors'
import type { PersonService } from './index'

import pages from '../form-pages/apply'
import { formatDateString } from '../utils/utils'
import paths from '../paths/apply'

export type DataServices = {
  personService: PersonService
}

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(token: string, crn: string): Promise<Application> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.create(crn)

    return application
  }

  async getCurrentPage(
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
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
    const session = this.getAllSessionData(request)
    const page = new Page(body, session, request.session.previousPage)

    if (page.setup) {
      await page.setup(request, dataServices)
    }

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors ? page.errors() : []

    if (errors.length) {
      throw new ValidationError(errors)
    } else {
      this.saveToSession(page, request)
      await this.saveToApi(request)
    }
  }

  private saveToSession(page: TasklistPage, request: Request) {
    request.session = this.fetchOrInitializeSessionData(request.session, request.params.task, request.params.id)
    request.session.application[request.params.id][request.params.task][request.params.page] = page.body
    request.session.previousPage = page.name
  }

  private async saveToApi(request: Request) {
    const client = this.applicationClientFactory(request.user.token)

    await client.update(request.session.application[request.params.id] as Application, request.params.id)
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
    return this.getSessionDataForPage(request)
  }

  private getAllSessionData(request: Request) {
    const data = this.fetchOrInitializeSessionData(request.session, request.params.task, request.params.id)

    return data.application[request.params.id] || {}
  }

  private getSessionDataForPage(request: Request) {
    return this.getAllSessionData(request)[request.params.task][request.params.page] || {}
  }

  async tableRows(token: string): Promise<(TextItem | HtmlItem)[][]> {
    const applicationClient = this.applicationClientFactory(token)

    const applicationSummaries = await applicationClient.all()

    return applicationSummaries.map(application => {
      return [
        this.createNameAnchorElement(application.person.name, application.id),
        this.textValue(application.person.crn),
        this.createTierBadge(application.tier.level),
        this.textValue(formatDateString(application.arrivalDate)),
        this.createStatusTag(application.status),
      ]
    })
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private createTierBadge(tier: string) {
    const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

    return this.htmlValue(`<span class="moj-badge ${colour}">${tier}</span>`)
  }

  private createNameAnchorElement(name: string, applicationId: string) {
    return this.htmlValue(`<a href=${paths.applications.show({ id: applicationId })}>${name}</a>`)
  }

  private createStatusTag(value: string) {
    const colour = {
      'In progress': 'govuk-tag--blue',
      Submitted: '',
      'Information Requested': 'govuk-tag--yellow',
      Rejected: 'govuk-tag--red',
    }[value]

    return this.htmlValue(`<strong class="govuk-tag ${colour}">${value}</strong>`)
  }
}
