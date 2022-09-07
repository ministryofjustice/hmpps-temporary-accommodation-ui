import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ApplicationsController from './applicationsController'
import ApplicationService from '../../services/applicationService'

describe('applicationsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})

  let applicationsController: ApplicationsController

  beforeEach(() => {
    applicationsController = new ApplicationsController(applicationService)
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
})
