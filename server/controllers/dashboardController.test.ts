import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import DashboardController from './dashboardController'
import paths from '../paths/temporary-accommodation/manage'

jest.mock('../utils/applicationUtils')

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    it('should redirect to /properties', () => {
      const requestHandler = dashboardController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.premises.index({}))
    })
  })
})
