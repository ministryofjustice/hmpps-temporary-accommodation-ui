import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ApplicationController from './applicationController'
import paths from '../paths/temporary-accommodation/manage'

jest.mock('../utils/applicationUtils')

describe('ApplicationController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let applicationController: ApplicationController

  beforeEach(() => {
    applicationController = new ApplicationController()
  })

  describe('index', () => {
    it('should redirect to /properties', () => {
      const requestHandler = applicationController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.premises.index({}))
    })
  })
})
