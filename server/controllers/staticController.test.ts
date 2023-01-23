import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import StaticController from './staticController'

describe('StaticController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let staticController: StaticController

  beforeEach(() => {
    staticController = new StaticController()
  })

  describe('cookies', () => {
    it('should render the page', () => {
      const requestHandler = staticController.cookies()
      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/static/cookies')
    })
  })
})
