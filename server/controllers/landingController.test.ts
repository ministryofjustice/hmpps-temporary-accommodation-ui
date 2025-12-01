import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import paths from '../paths/apply'
import managePaths from '../paths/temporary-accommodation/manage'
import staticPaths from '../paths/temporary-accommodation/static'
import { userFactory } from '../testutils/factories'
import { UnauthorizedError } from '../utils/errors'
import { isApplyEnabledForUser } from '../utils/userUtils'
import LandingController from './landingController'

jest.mock('../utils/userUtils', () => {
  const module = jest.requireActual('../utils/userUtils')

  return {
    ...module,
    isApplyEnabledForUser: jest.fn(),
  }
})

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

    it('redirects to the dashboard when the user is a referrer from an enbaled region', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: ['referrer'],
            region: { name: 'Kent, Surrey & Sussex' },
          }),
        },
      })
      ;(isApplyEnabledForUser as jest.MockedFunction<typeof isApplyEnabledForUser>).mockReturnValue(true)

      const requestHandler = landingController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.applications.index({}))
    })

    it('redirects to use-ndelius page when the user is a referrer from a disabled region', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: ['referrer'],
            region: { name: 'London' },
          }),
        },
      })
      ;(isApplyEnabledForUser as jest.MockedFunction<typeof isApplyEnabledForUser>).mockReturnValue(false)

      const requestHandler = landingController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(staticPaths.static.useNDelius.pattern)
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

    it('redirects to the reports page when the user is a reporter', () => {
      const response: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: userFactory.build({
            roles: ['reporter'],
          }),
        },
      })

      const requestHandler = landingController.index()
      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(managePaths.reports.index({}))
    })
  })
})
