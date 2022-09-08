import type { Request } from 'express'
import { createMock } from '@golevelup/ts-jest'

import type { TasklistPage, TaskListErrors } from 'approved-premises'
import { UnknownPageError, ValidationError } from '../utils/errors'
import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'

import pages from '../form-pages/apply'

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

  describe('createApplication', () => {
    it('calls the create method and returns a uuid', async () => {
      const uuid = 'some-uuid'
      const token = 'SOME_TOKEN'

      applicationClient.create.mockResolvedValue(uuid)

      const result = await service.createApplication(token)

      expect(result).toEqual(uuid)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalled()
    })
  })

  describe('getCurrentPage', () => {
    const request = createMock<Request>({ params: { task: 'my-task' } })

    it('should return the first page if the page is not defined', () => {
      const result = service.getCurrentPage(request)

      expect(result).toBeInstanceOf(FirstPage)

      expect(FirstPage).toHaveBeenCalledWith(request.body)
    })

    it('should return a page from a page list', () => {
      request.params.page = 'second'

      const result = service.getCurrentPage(request)

      expect(result).toBeInstanceOf(SecondPage)

      expect(SecondPage).toHaveBeenCalledWith(request.body)
    })

    it('should raise an error if the page is not found', () => {
      request.params.page = 'bar'

      expect(() => {
        service.getCurrentPage(request)
      }).toThrow(UnknownPageError)
    })

    it('should raise an error if the task is not specified', () => {
      request.params.task = undefined

      expect(() => {
        service.getCurrentPage(request)
      }).toThrow(UnknownPageError)
    })
  })

  describe('save', () => {
    it('throws an error is there is a validation error', () => {
      const errors = createMock<TaskListErrors>([{ propertyName: 'foo', errorType: 'bar' }])
      const page = createMock<TasklistPage>({
        errors: () => errors,
      })

      expect(() => service.save(page)).toThrow(new ValidationError(errors))
    })

    it('does not throw an error if there are no validation errors', () => {
      const page = createMock<TasklistPage>({
        errors: () => [] as TaskListErrors,
      })

      expect(() => service.save(page)).not.toThrow(ValidationError)
    })

    it('does not thow an error when the page has no errors method', () => {
      const page = createMock<TasklistPage>({
        errors: undefined,
      })

      expect(() => service.save(page)).not.toThrow(ValidationError)
    })
  })
})
