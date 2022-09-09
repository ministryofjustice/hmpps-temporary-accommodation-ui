import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { TasklistPage, ErrorsAndUserInput } from 'approved-premises'
import PagesController from './pagesController'
import { ApplicationService } from '../../../services'
import type { DataServices } from '../../../services/applicationService'

import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../../../utils/validation'
import { UnknownPageError } from '../../../utils/errors'
import paths from '../../../paths/apply'

jest.mock('../../../utils/validation')

describe('pagesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const dataServices = createMock<DataServices>({}) as DataServices

  let pagesController: PagesController

  beforeEach(() => {
    pagesController = new PagesController(applicationService, dataServices)
  })

  describe('show', () => {
    const page = createMock<TasklistPage>({
      name: 'page-name',
    })

    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
        task: 'some-task',
      }

      applicationService.getCurrentPage.mockReturnValue(page)
    })

    it('renders a page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = pagesController.show()

      requestHandler(request, response, next)

      expect(applicationService.getCurrentPage).toHaveBeenCalledWith(request, {})

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: {},
        errorSummary: [],
        ...page.body,
      })
    })

    it('shows errors and user input when returning from an error state', () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = pagesController.show()

      requestHandler(request, response, next)

      expect(applicationService.getCurrentPage).toHaveBeenCalledWith(request, errorsAndUserInput.userInput)

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', () => {
      applicationService.getCurrentPage.mockImplementation(() => {
        throw new UnknownPageError()
      })

      const requestHandler = pagesController.show()

      requestHandler(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('throws an error when the error is not an unknown page error', () => {
      const genericError = new Error()

      applicationService.getCurrentPage.mockImplementation(() => {
        throw genericError
      })

      const requestHandler = pagesController.show()

      expect(() => requestHandler(request, response, next)).toThrow(genericError)
    })
  })

  describe('update', () => {
    const page = createMock<TasklistPage>({
      name: 'page-name',
    })

    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
        task: 'some-task',
      }

      applicationService.getCurrentPage.mockReturnValue(page)
    })

    it('updates an application and redirects to the next page', () => {
      page.next.mockReturnValue('next-page')

      applicationService.save.mockReturnValue()

      const requestHandler = pagesController.update()

      requestHandler(request, response)

      expect(applicationService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: request.params.id, task: request.params.task, page: 'next-page' }),
      )
    })

    it('sets a flash and redirects if there are errors', () => {
      const err = new Error()
      applicationService.save.mockImplementation(() => {
        throw err
      })

      const requestHandler = pagesController.update()

      requestHandler(request, response)

      expect(applicationService.save).toHaveBeenCalledWith(page, request)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.applications.pages.show({ id: request.params.id, task: request.params.task, page: page.name }),
      )
    })
  })
})
