import type { Request } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { TaskListErrors } from 'approved-premises'

import applicationSummaryFactory from '../testutils/factories/applicationSummary'
import type TasklistPage from '../form-pages/tasklistPage'
import { UnknownPageError, ValidationError } from '../utils/errors'
import ApplicationService, { type DataServices } from './applicationService'
import ApplicationClient from '../data/applicationClient'

import pages from '../form-pages/apply'
import paths from '../paths/apply'
import { formatDateString } from '../utils/utils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    'my-task': {},
  }
})

pages['my-task'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')

describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getApplications', () => {
    it('calls the all method on the client and returns the data in the correct format for the table in the view', async () => {
      const applicationSummaryA = applicationSummaryFactory.build({
        arrivalDate: new Date(2022, 0, 1).toISOString(),
        person: { name: 'A', crn: '1' },
        currentLocation: 'Location 1',
        daysSinceApplicationRecieved: 1,
        id: 'some-id',
        status: 'In progress',
        tier: { lastUpdated: '', level: 'A1' },
      })
      const applicationSummaryB = applicationSummaryFactory.build({
        arrivalDate: new Date(2022, 1, 1).toISOString(),
        person: { name: 'B', crn: '2' },
        currentLocation: 'Location 2',
        daysSinceApplicationRecieved: 2,
        id: 'some-id',
        status: 'Information Requested',
        tier: { lastUpdated: '', level: 'B1' },
      })

      const applicationSummaries = [applicationSummaryA, applicationSummaryB]
      const token = 'SOME_TOKEN'

      applicationClient.all.mockResolvedValue(applicationSummaries)

      const result = await service.tableRows(token)

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationSummaryA.id })}>${
              applicationSummaryA.person.name
            }</a>`,
          },
          {
            text: applicationSummaryA.person.crn,
          },
          {
            html: `<span class="moj-badge moj-badge--red">${applicationSummaryA.tier.level}</span>`,
          },
          {
            text: formatDateString(applicationSummaryA.arrivalDate),
          },
          {
            html: `<strong class="govuk-tag govuk-tag--blue">${applicationSummaryA.status}</strong>`,
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationSummaryB.id })}>${
              applicationSummaryB.person.name
            }</a>`,
          },
          {
            text: applicationSummaryB.person.crn,
          },
          {
            html: `<span class="moj-badge moj-badge--purple">${applicationSummaryB.tier.level}</span>`,
          },
          {
            text: formatDateString(applicationSummaryB.arrivalDate),
          },
          {
            html: `<strong class="govuk-tag govuk-tag--yellow">${applicationSummaryB.status}</strong>`,
          },
        ],
      ])

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns a uuid', async () => {
      const uuid = 'some-uuid'
      const token = 'SOME_TOKEN'

      applicationClient.create.mockResolvedValue(uuid)

      const result = await service.createApplication(token)

      expect(result).toBe(uuid)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalled()
    })
  })

  describe('getCurrentPage', () => {
    let request: DeepMocked<Request>
    const dataServices = createMock<DataServices>({}) as DataServices

    beforeEach(() => {
      request = createMock<Request>({ params: { id: 'some-uuid', task: 'my-task' } })
    })

    it('should return the first page if the page is not defined', async () => {
      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(FirstPage)

      expect(FirstPage).toHaveBeenCalledWith(request.body)
    })

    it('should return a page from a page list', async () => {
      request.params.page = 'second'

      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(SecondPage)

      expect(SecondPage).toHaveBeenCalledWith(request.body)
    })

    it('should initialize the page with the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      const result = await service.getCurrentPage(request, dataServices, userInput)

      expect(result).toBeInstanceOf(FirstPage)

      expect(FirstPage).toHaveBeenCalledWith(userInput)
    })

    it('should load from the session if the body and userInput are blank', async () => {
      request.body = {}
      request.session.application = { 'some-uuid': { 'my-task': { first: { foo: 'bar' } } } }

      const result = await service.getCurrentPage(request, dataServices)

      expect(result).toBeInstanceOf(FirstPage)

      expect(FirstPage).toHaveBeenCalledWith({ foo: 'bar' })
    })

    it("should call a service's setup method if it exists", async () => {
      const setup = jest.fn()
      SecondPage.mockReturnValue({ setup })

      request.params.page = 'second'

      await service.getCurrentPage(request, dataServices)

      expect(setup).toHaveBeenCalledWith(request, dataServices)
    })

    it('should raise an error if the page is not found', async () => {
      request.params.page = 'bar'

      expect(async () => {
        await service.getCurrentPage(request, dataServices)
      }).rejects.toThrow(UnknownPageError)
    })

    it('should raise an error if the task is not specified', async () => {
      request.params.task = undefined

      expect(async () => {
        await service.getCurrentPage(request, dataServices)
      }).rejects.toThrow(UnknownPageError)
    })
  })

  describe('save', () => {
    const request = createMock<Request>({ params: { id: 'some-uuid', task: 'some-task', page: 'some-page' } })

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        page = createMock<TasklistPage>({
          errors: () => [] as TaskListErrors,
          body: { foo: 'bar' },
        })
      })

      it('does not throw an error', () => {
        expect(() => service.save(page, request)).not.toThrow(ValidationError)
      })

      it('saves data to the session', () => {
        service.save(page, request)

        expect(request.session.application).toEqual({ 'some-uuid': { 'some-task': { 'some-page': { foo: 'bar' } } } })
      })
    })

    it('throws an error if there is a validation error', () => {
      const errors = createMock<TaskListErrors>([{ propertyName: 'foo', errorType: 'bar' }])
      const page = createMock<TasklistPage>({
        errors: () => errors,
      })

      expect(() => service.save(page, request)).toThrow(new ValidationError(errors))
    })

    it('does not thow an error when the page has no errors method', () => {
      const page = createMock<TasklistPage>({
        errors: undefined,
      })

      expect(() => service.save(page, request)).not.toThrow(ValidationError)
    })
  })
})
