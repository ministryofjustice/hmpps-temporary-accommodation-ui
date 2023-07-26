import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import DashboardController from './dashboardController'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    it('should render the page', () => {
      const requestHandler = dashboardController.index()
      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/dashboard/index')
    })
  })
})
