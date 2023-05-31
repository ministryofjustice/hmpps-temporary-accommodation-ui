import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import type { DataServices, ErrorsAndUserInput, FormPages } from '@approved-premises/ui'
import Apply from '../../../form-pages/apply'
import TasklistPage from '../../../form-pages/tasklistPage'
import { ApplicationService } from '../../../services'
import { getPage } from '../../../utils/applicationUtils'
import PagesController from './pagesController'

import { CallConfig } from '../../../data/restClient'
import { viewPath } from '../../../form-pages/utils'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'

jest.mock('../../../utils/validation')
jest.mock('../../../form-pages/utils')
jest.mock('../../../utils/applicationUtils')
jest.mock('../../../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})
jest.mock('../../../utils/restUtils')

Apply.pages = {} as FormPages

describe('pagesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const dataServices = createMock<DataServices>({}) as DataServices

  const PageConstructor = jest.fn()
  const page = createMock<TasklistPage>({})

  let pagesController: PagesController

  beforeEach(() => {
    pagesController = new PagesController(applicationService, dataServices)
    applicationService.initializePage.mockResolvedValue(page)
    ;(getPage as jest.Mock).mockReturnValue(PageConstructor)
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('show', () => {
    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
      }
      ;(viewPath as jest.Mock).mockReturnValue('applications/pages/some/view')
    })

    it('renders a page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(getPage).toHaveBeenCalledWith('some-task', 'some-page')
      expect(applicationService.initializePage).toHaveBeenCalledWith(
        callConfig,
        PageConstructor,
        request,
        dataServices,
        {},
      )

      expect(response.render).toHaveBeenCalledWith('applications/pages/some/view', {
        applicationId: request.params.id,
        task: 'some-task',
        page,
        errors: {},
        errorSummary: [],
        ...page.body,
      })
    })

    it('shows errors and user input when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(applicationService.initializePage).toHaveBeenCalledWith(
        callConfig,
        PageConstructor,
        request,
        dataServices,
        errorsAndUserInput.userInput,
      )

      expect(response.render).toHaveBeenCalledWith('applications/pages/some/view', {
        applicationId: request.params.id,
        task: 'some-task',
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', async () => {
      applicationService.initializePage.mockImplementation(() => {
        throw new UnknownPageError('some-page')
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()

      applicationService.initializePage.mockImplementation(() => {
        throw genericError
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
      }

      applicationService.initializePage.mockResolvedValue(page)
    })

    it('updates an application and redirects to the next page', async () => {
      page.next.mockReturnValue('next-page')

      applicationService.save.mockResolvedValue()

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler({ ...request }, response)

      expect(applicationService.save).toHaveBeenCalledWith(callConfig, page, request)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: request.params.id, task: 'some-task', page: 'next-page' }),
      )
    })

    it('redirects to the tasklist if there is no next page', async () => {
      page.next.mockReturnValue(undefined)

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(applicationService.save).toHaveBeenCalledWith(callConfig, page, request)

      expect(response.redirect).toHaveBeenCalledWith(paths.applications.show({ id: request.params.id }))
    })

    it('sets a flash and redirects if there are errors', async () => {
      const err = new Error()
      applicationService.save.mockImplementation(() => {
        throw err
      })

      const requestHandler = pagesController.update('some-task', 'page-name')

      await requestHandler(request, response)

      expect(applicationService.save).toHaveBeenCalledWith(callConfig, page, request)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.applications.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
      )
    })
  })
})
