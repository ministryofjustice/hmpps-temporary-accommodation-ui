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

  describe('useNDelius', () => {
    it('should render the disabled-region page', () => {
      const requestHandler = staticController.useNDelius()
      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/static/useNDelius')
    })
  })

  describe('notAuthorised', () => {
    it('should render the not authorise page', () => {
      const requestHandler = staticController.notAuthorised()
      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/static/notAuthorised')
    })
  })
})
