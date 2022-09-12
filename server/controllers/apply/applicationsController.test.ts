import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ApplicationsController from './applicationsController'
import ApplicationService from '../../services/applicationService'
import paths from '../../paths/apply'

describe('applicationsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})

  let applicationsController: ApplicationsController

  beforeEach(() => {
    applicationsController = new ApplicationsController(applicationService)
  })

  describe('list', () => {
    it('renders the list view', async () => {
      applicationService.tableRows.mockResolvedValue([])
      const requestHandler = applicationsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/list', {
        pageHeading: 'Approved Premises applications',
        applicationSummaries: [],
      })
      expect(applicationService.tableRows).toHaveBeenCalled()
    })
  })

  describe('new', () => {
    it('renders the start page', () => {
      const requestHandler = applicationsController.new()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/new', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    })
  })

  describe('create', () => {
    it('creates an application and redirects to the first page of the first step', async () => {
      const uuid = 'some-uuid'
      applicationService.createApplication.mockResolvedValue(uuid)

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(applicationService.createApplication).toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: uuid, task: 'basic-information', page: 'enter-crn' }),
      )
    })
  })
})
