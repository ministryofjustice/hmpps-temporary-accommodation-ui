import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { TasklistPage, ErrorsAndUserInput } from 'approved-premises'
import PagesController from './pagesController'
import ApplicationService from '../../../services/applicationService'
import { fetchErrorsAndUserInput } from '../../../utils/validation'
import { UnknownPageError } from '../../../utils/errors'

jest.mock('../../../utils/validation')

describe('pagesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})

  let pagesController: PagesController

  beforeEach(() => {
    pagesController = new PagesController(applicationService)
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

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: {},
        errorSummary: [],
      })
    })

    it('shows errors and user input when returning from an error state', () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = pagesController.show()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(`applications/pages/${request.params.task}/${page.name}`, {
        applicationId: request.params.id,
        task: request.params.task,
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
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
})
