import type { ActiveOffence, TemporaryAccommodationApplication as Application, Document } from '@approved-premises/api'
import type { DataServices, GroupedApplications } from '@approved-premises/ui'
import type { Request } from 'express'

import type { ApplicationClient, RestClientBuilder } from '../data'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'

import { CallConfig } from '../data/restClient'
import Review from '../form-pages/apply/check-your-answers/review'
import { getBody, getPageName, getTaskName, pageBodyShallowEquals } from '../form-pages/utils'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(callConfig: CallConfig, crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const applicationClient = this.applicationClientFactory(callConfig)

    const application = await applicationClient.create(crn, activeOffence)

    return application
  }

  async findApplication(callConfig: CallConfig, id: string): Promise<Application> {
    const applicationClient = this.applicationClientFactory(callConfig)

    const application = await applicationClient.find(id)

    return application
  }

  async getAllForLoggedInUser(callConfig: CallConfig): Promise<GroupedApplications> {
    const applicationClient = this.applicationClientFactory(callConfig)
    const allApplications = await applicationClient.all()
    const result = {
      inProgress: [],
      submitted: [],
    } as GroupedApplications

    await Promise.all(
      allApplications.map(async application => {
        switch (application.status) {
          case 'submitted':
            result.submitted.push(application)
            break
          default:
            result.inProgress.push(application)
            break
        }
      }),
    )

    return result
  }

  async getDocuments(callConfig: CallConfig, application: Application): Promise<Array<Document>> {
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
      ? await Page.initialize(body, application, callConfig, dataServices)
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

      const oldBody = application.data?.[taskName]?.[pageName]

      application.data = application.data || {}
      application.data[taskName] = application.data[taskName] || {}
      application.data[taskName][pageName] = page.body

      const reviewTaskName = getTaskName(Review)
      const reviewPageName = getPageName(Review)

      if (application.data[reviewTaskName] && !(taskName === reviewTaskName && pageName === reviewPageName)) {
        if (!oldBody || !pageBodyShallowEquals(oldBody, page.body)) {
          delete application.data[reviewTaskName]
        }
      }

      this.saveToSession(application, page, request)
      await this.saveToApi(callConfig, application)
    }
  }

  async submit(callConfig: CallConfig, application: Application) {
    const client = this.applicationClientFactory(callConfig)

    await client.submit(application.id, getApplicationSubmissionData(application))
  }

  async getApplicationFromSessionOrAPI(callConfig: CallConfig, request: Request): Promise<Application> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(callConfig, request.params.id)
  }

  private async saveToSession(application: Application, page: TasklistPage, request: Request) {
    request.session.application = application
    request.session.previousPage = request.params.page
  }

  private async saveToApi(callConfig: CallConfig, application: Application) {
    const client = this.applicationClientFactory(callConfig)

    await client.update(application.id, getApplicationUpdateData(application))
  }
}
