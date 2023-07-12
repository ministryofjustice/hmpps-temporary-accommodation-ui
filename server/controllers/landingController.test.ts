import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import paths from '../paths/apply'
import managePaths from '../paths/temporary-accommodation/manage'
import { userFactory } from '../testutils/factories'
import { UnauthorizedError } from '../utils/errors'
import LandingController from './landingController'

describe('LandingController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let landingController: LandingController

  beforeEach(() => {
    landingController = new LandingController()
  })

  describe('index', () => {
    it('redirects to the dashboard when the user is an assessor', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: ['assessor'],
          }),
        },
      })

      const requestHandler = landingController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(managePaths.dashboard.index({}))
    })

    it('redirects to the dashboard when the user is a referrer', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: ['referrer'],
          }),
        },
      })

      const requestHandler = landingController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.applications.index({}))
    })

    it('throws an error if the user is neither a assessor or a referrer', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: [],
          }),
        },
      })

      const requestHandler = landingController.index()

      expect(() => requestHandler(request, response, next)).toThrowError(UnauthorizedError)
    })
  })
})
