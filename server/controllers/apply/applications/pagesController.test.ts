import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { ErrorsAndUserInput } from 'approved-premises'
import PagesController from './pagesController'
import { ApplicationService } from '../../../services'
import type { DataServices } from '../../../services/applicationService'
import TasklistPage from '../../../form-pages/tasklistPage'

import {
  fetchErrorsAndUserInput,
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
} from '../../../utils/validation'
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

      applicationService.getCurrentPage.mockResolvedValue(page)
    })

    it('renders a page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = pagesController.show()

      await requestHandler(request, response, next)

      expect(applicationService.getCurrentPage).toHaveBeenCalledWith(request, dataServices, {})

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: {},
        errorSummary: [],
        ...page.body,
      })
    })

    it('shows errors and user input when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = pagesController.show()

      await requestHandler(request, response, next)

      expect(applicationService.getCurrentPage).toHaveBeenCalledWith(
        request,
        dataServices,
        errorsAndUserInput.userInput,
      )

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', async () => {
      applicationService.getCurrentPage.mockImplementation(() => {
        throw new UnknownPageError()
      })

      const requestHandler = pagesController.show()

      await requestHandler(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()

      applicationService.getCurrentPage.mockImplementation(() => {
        throw genericError
      })

      const requestHandler = pagesController.show()

      await requestHandler(request, response, next)

      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
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

      applicationService.getCurrentPage.mockResolvedValue(page)
    })

    it('updates an application and redirects to the next page', async () => {
      page.next.mockReturnValue('next-page')

      applicationService.save.mockResolvedValue()

      const requestHandler = pagesController.update()

      await requestHandler({ ...request }, response)

      expect(applicationService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: request.params.id, task: request.params.task, page: 'next-page' }),
      )
    })

    it('redirects to the tasklist if there is no next page', async () => {
      page.next.mockReturnValue(undefined)

      const requestHandler = pagesController.update()

      await requestHandler(request, response)

      expect(applicationService.save).toHaveBeenCalledWith(page, request)

      expect(response.redirect).toHaveBeenCalledWith(paths.applications.show({ id: request.params.id }))
    })

    it('sets a flash and redirects if there are errors', async () => {
      const err = new Error()
      applicationService.save.mockImplementation(() => {
        throw err
      })

      const requestHandler = pagesController.update()

      await requestHandler(request, response)

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
