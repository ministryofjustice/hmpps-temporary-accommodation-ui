import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import type { DataServices, TaskListErrors } from '@approved-premises/ui'

import ApplicationClient from '../data/applicationClient'
import type TasklistPage from '../form-pages/tasklistPage'
import * as formPageUtils from '../form-pages/utils'
import { ValidationError } from '../utils/errors'
import ApplicationService from './applicationService'

import {
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../@types/shared'
import { CallConfig } from '../data/restClient'
import Apply from '../form-pages/apply'
import Review from '../form-pages/apply/check-your-answers/review'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import {
  activeOffenceFactory,
  applicationFactory,
  applicationSummaryFactory,
  documentFactory,
} from '../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})

Apply.pages['my-task'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../utils/applicationUtils')
jest.mock('../utils/applicationUtils')
jest.mock('../utils/applications/getApplicationData')

describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getAllForLoggedInUser', () => {
    const submittedApplications = applicationSummaryFactory.buildList(5, { status: 'submitted' })
    const inProgressApplications = applicationSummaryFactory.buildList(2, { status: 'inProgress' })

    const applications = [submittedApplications, inProgressApplications].flat()

    it('fetches all applications', async () => {
      applicationClient.all.mockResolvedValue(applications)

      const callConfig = { token: 'some-token' } as CallConfig

      const result = await service.getAllForLoggedInUser(callConfig)

      expect(result).toEqual({
        inProgress: inProgressApplications,
        submitted: submittedApplications,
      })

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns an application', async () => {
      const application = applicationFactory.build()
      const offence = activeOffenceFactory.build()

      const callConfig = { token: 'some-token' } as CallConfig

      applicationClient.create.mockResolvedValue(application)

      const result = await service.createApplication(callConfig, application.person.crn, offence)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.create).toHaveBeenCalledWith(application.person.crn, offence)
    })
  })

  describe('findApplication', () => {
    it('calls the find method and returns an application', async () => {
      const application = applicationFactory.build()
      const callConfig = { token: 'some-token' } as CallConfig

      applicationClient.find.mockResolvedValue(application)

      const result = await service.findApplication(callConfig, application.id)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.find).toHaveBeenCalledWith(application.id)
    })
  })

  describe('getDocuments', () => {
    it('calls the documents method and returns a list of documents', async () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(5)

      const callConfig = { token: 'some-token' } as CallConfig

      applicationClient.documents.mockResolvedValue(documents)

      const result = await service.getDocuments(callConfig, application)

      expect(result).toEqual(documents)

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.documents).toHaveBeenCalledWith(application)
    })
  })

  describe('getApplicationFromSessionOrAPI', () => {
    let request: DeepMocked<Request>

    const callConfig = { token: 'some-token' } as CallConfig
    const application = applicationFactory.build()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      request.session.application = undefined
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(callConfig, request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should fetch the application from the session if it is present', async () => {
      request.session.application = application

      const result = await service.getApplicationFromSessionOrAPI(callConfig, request)

      expect(result).toEqual(application)

      expect(applicationClient.find).not.toHaveBeenCalled()
    })

    it('should fetch the application from the API if and application is in the session but it is not the same application as the one being requested', async () => {
      request.session.application = applicationFactory.build()
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(callConfig, request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const callConfig = { token: 'some-token' } as CallConfig
    const dataServices = createMock<DataServices>({}) as DataServices
    const application = applicationFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id, task: 'my-task', page: 'first' },
        session: { application, previousPage: '' },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      request.session.application = undefined
      applicationClient.find.mockResolvedValue(application)
      jest.spyOn(formPageUtils, 'getBody').mockReturnValue(request.body)

      const result = await service.initializePage(callConfig, Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, request.session)
      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should return the session and a page from a page list', async () => {
      jest.spyOn(formPageUtils, 'getBody').mockReturnValue(request.body)

      const result = await service.initializePage(callConfig, Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, request.session)
    })

    it('should initialize the page with the session and the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      jest.spyOn(formPageUtils, 'getBody').mockReturnValue(userInput)

      const result = await service.initializePage(callConfig, Page, request, dataServices, userInput)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(userInput, application, request.session)
    })

    it('should load from the session if the body and userInput are blank', async () => {
      request.body = {}
      request.session.application.data = { 'my-task': { first: { foo: 'bar' } } }
      jest.spyOn(formPageUtils, 'getBody').mockReturnValue(request.session.application.data['my-task'].first)

      const result = await service.initializePage(callConfig, Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith({ foo: 'bar' }, application, request.session)
    })

    it("should call a service's initialize method if it exists", async () => {
      const OtherPage = { initialize: jest.fn() } as unknown as TasklistPageInterface
      jest.spyOn(formPageUtils, 'getBody').mockReturnValue(request.body)

      await service.initializePage(callConfig, OtherPage, request, dataServices)

      expect(OtherPage.initialize).toHaveBeenCalledWith(
        request.body,
        application,
        callConfig,
        dataServices,
        request.session,
      )
    })
  })

  describe('save', () => {
    const application = applicationFactory.build({ data: null })
    const callConfig = { token: 'some-token' } as CallConfig
    const request = createMock<Request>({
      params: { id: application.id, task: 'some-task', page: 'some-page' },
      session: { application },
    })
    const applicationData = createMock<UpdateApplication>()

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { foo: 'bar' },
        })
        jest
          .spyOn(formPageUtils, 'getPageName')
          .mockImplementation(pageClass => (pageClass === Review ? 'review' : 'some-page'))
        jest
          .spyOn(formPageUtils, 'getTaskName')
          .mockImplementation(pageClass => (pageClass === Review ? 'check-your-answers' : 'some-task'))
        jest.spyOn(formPageUtils, 'pageBodyShallowEquals').mockReturnValue(false)
        ;(getApplicationUpdateData as jest.Mock).mockReturnValue(applicationData)
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(callConfig, page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the session', async () => {
        await service.save(callConfig, page, request)

        expect(request.session.application).toEqual(application)
        expect(request.session.application.data).toEqual({ 'some-task': { 'some-page': { foo: 'bar' } } })
      })

      it('saves data to the api', async () => {
        await service.save(callConfig, page, request)

        expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
        expect(applicationClient.update).toHaveBeenCalledWith(application.id, applicationData)
      })

      it('updates an in-progress application', async () => {
        application.data = { 'some-task': { 'other-page': { question: 'answer' } } }

        await service.save(callConfig, page, request)

        expect(request.session.application).toEqual(application)
        expect(request.session.application.data).toEqual({
          'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
        })
      })

      it('invalidates the check your answers task when saving a new page', async () => {
        application.data = {
          'some-task': { 'other-page': { question: 'answer' } },
          'check-your-answers': { review: { reviewed: '1' } },
        }

        await service.save(callConfig, page, request)

        expect(request.session.application.data).toEqual({
          'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
        })
        expect(getApplicationUpdateData).toHaveBeenCalledWith({
          ...application,
          data: {
            'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
          },
        })
      })

      it('invalidates the check your answers task when changing an existing page', async () => {
        application.data = {
          'some-task': { 'some-page': { foo: 'baz' }, 'other-page': { question: 'answer' } },
          'check-your-answers': { review: { reviewed: '1' } },
        }

        await service.save(callConfig, page, request)

        expect(request.session.application.data).toEqual({
          'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
        })
        expect(getApplicationUpdateData).toHaveBeenCalledWith({
          ...application,
          data: {
            'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
          },
        })
      })

      it('does not invalidate the check your answers task when saving an existing page with unchanged data', async () => {
        application.data = {
          'some-task': { 'some-page': { foo: 'bar' } },
          'check-your-answers': { review: { reviewed: '1' } },
        }
        jest.spyOn(formPageUtils, 'pageBodyShallowEquals').mockReturnValue(true)

        await service.save(callConfig, page, request)

        expect(request.session.application.data).toEqual({
          'some-task': { 'some-page': { foo: 'bar' } },
          'check-your-answers': { review: { reviewed: '1' } },
        })
        expect(getApplicationUpdateData).toHaveBeenCalledWith({
          ...application,
          data: {
            'some-task': { 'some-page': { foo: 'bar' } },
            'check-your-answers': { review: { reviewed: '1' } },
          },
        })
      })

      it('does not invalidate the check your answers task when saving a check your answers page', async () => {
        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { reviewed: '1' },
        })

        application.data = {
          'some-task': { 'other-page': { question: 'answer' } },
        }
        jest.spyOn(formPageUtils, 'getTaskName').mockReturnValue('check-your-answers')
        jest.spyOn(formPageUtils, 'getPageName').mockReturnValue('review')

        await service.save(callConfig, page, request)

        expect(request.session.application.data).toEqual({
          'some-task': {
            'other-page': { question: 'answer' },
          },
          'check-your-answers': { review: { reviewed: '1' } },
        })
        expect(getApplicationUpdateData).toHaveBeenCalledWith({
          ...application,
          data: {
            'some-task': {
              'other-page': { question: 'answer' },
            },
            'check-your-answers': { review: { reviewed: '1' } },
          },
        })
      })
    })

    describe('When there validation errors', () => {
      it('throws an error if there is a validation error', async () => {
        const errors = createMock<TaskListErrors<TasklistPage>>({ knowOralHearingDate: 'error' })
        const page = createMock<TasklistPage>({
          errors: () => errors,
        })

        expect.assertions(1)
        try {
          await service.save(callConfig, page, request)
        } catch (e) {
          expect(e).toEqual(new ValidationError(errors))
        }
      })
    })
  })

  describe('deletApplication', () => {
    const application = applicationFactory.build({ data: { 'some-task': { 'other-page': { question: 'answer' } } } })
    const callConfig = { token: 'some-token' } as CallConfig

    it('calls the delete method', async () => {
      await service.deleteApplication(callConfig, application.id)

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.delete).toHaveBeenCalledWith(application.id)
    })
  })

  describe('submit', () => {
    const callConfig = { token: 'some-token' } as CallConfig
    const application = applicationFactory.build()
    const applicationData = createMock<SubmitApplication>()

    it('calls the submit client method', async () => {
      ;(getApplicationSubmissionData as jest.Mock).mockReturnValue(applicationData)
      await service.submit(callConfig, application)

      expect(applicationClientFactory).toHaveBeenCalledWith(callConfig)
      expect(applicationClient.submit).toHaveBeenCalledWith(application.id, applicationData)

      expect(getApplicationSubmissionData).toHaveBeenCalledWith(application)
    })
  })
})
