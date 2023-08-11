import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { userFactory } from '../../../testutils/factories'
import config from '../../../config'
import DashboardController from './dashboardController'

jest.mock('../../../utils/enabledRegions', () => {
  return ['Kent, Surrey & Sussex']
})

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({
    locals: {
      user: userFactory.build({
        roles: ['assessor'],
        region: { name: 'Kent, Surrey & Sussex' },
      }),
    },
  })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    const originalValue = config.flags.applyEnabledForAllRegions

    afterEach(() => {
      config.flags.applyEnabledForAllRegions = originalValue
    })

    it('should render the page', () => {
      config.flags.applyEnabledForAllRegions = false
      const requestHandler = dashboardController.index()
      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/dashboard/index', {
        userReferralsEnabled: true,
      })
    })
  })
})
