import type { Request } from 'express'
import type { DataServices, GroupedApplications } from '@approved-premises/ui'
import type { ActiveOffence, ApprovedPremisesApplication, Document } from '@approved-premises/api'

import { isUnapplicable } from '../utils/applicationUtils'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import type { RestClientBuilder, ApplicationClient } from '../data'
import { ValidationError } from '../utils/errors'

import { getBody, getPageName, getTaskName } from '../form-pages/utils'
import { CallConfig } from '../data/restClient'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(
    callConfig: CallConfig,
    crn: string,
    activeOffence: ActiveOffence,
  ): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(callConfig)

    const application = await applicationClient.create(crn, activeOffence)

    return application
  }

  async findApplication(callConfig: CallConfig, id: string): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(callConfig)

    const application = await applicationClient.find(id)

    return application
  }

  async getAllForLoggedInUser(callConfig: CallConfig): Promise<GroupedApplications> {
    const applicationClient = this.applicationClientFactory(callConfig)
    const allApplications = await applicationClient.all()
    const result = {
      inProgress: [],
      requestedFurtherInformation: [],
      submitted: [],
    } as GroupedApplications

    const applications = allApplications.filter(application => !isUnapplicable(application))

    await Promise.all(
      applications.map(async application => {
        switch (application.status) {
          case 'submitted':
            result.submitted.push(application)
            break
          case 'requestedFurtherInformation':
            result.requestedFurtherInformation.push(application)
            break
          default:
            result.inProgress.push(application)
            break
        }
      }),
    )

    return result
  }

  async getDocuments(callConfig: CallConfig, application: ApprovedPremisesApplication): Promise<Array<Document>> {
    const applicationClient = this.applicationClientFactory(callConfig)

    const documents = await applicationClient.documents(application)

    return documents
  }

  async initializePage(
    callConfig: CallConfig,
    Page: TasklistPageInterface,
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
    const application = await this.getApplicationFromSessionOrAPI(callConfig, request)
    const body = getBody(Page, application, request, userInput)

    const page = Page.initialize
      ? await Page.initialize(body, application, request.user.token, dataServices)
      : new Page(body, application, request.session.previousPage)

    return page
  }

  async save(callConfig: CallConfig, page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const application = await this.getApplicationFromSessionOrAPI(callConfig, request)

      const pageName = getPageName(page.constructor)
      const taskName = getTaskName(page.constructor)

      application.data = application.data || {}
      application.data[taskName] = application.data[taskName] || {}
      application.data[taskName][pageName] = page.body

      this.saveToSession(application, page, request)
      await this.saveToApi(callConfig, application)
    }
  }

  async submit(callConfig: CallConfig, application: ApprovedPremisesApplication) {
    const client = this.applicationClientFactory(callConfig)

    await client.submit(application)
  }

  async getApplicationFromSessionOrAPI(callConfig: CallConfig, request: Request): Promise<ApprovedPremisesApplication> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(callConfig, request.params.id)
  }

  private async saveToSession(application: ApprovedPremisesApplication, page: TasklistPage, request: Request) {
    request.session.application = application
    request.session.previousPage = request.params.page
  }

  private async saveToApi(callConfig: CallConfig, application: ApprovedPremisesApplication) {
    const client = this.applicationClientFactory(callConfig)

    await client.update(application)
  }
}
