import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ApplicationController from './applicationController'
import paths from '../paths/manage'
import { getService } from '../utils/applicationUtils'

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
    describe('when used in the Approved Premises service', () => {
      it('should redirect to /premises', () => {
        ;(getService as jest.Mock).mockReturnValue('approved-premises')

        const requestHandler = applicationController.index()

        requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(paths.premises.index({}))
      })
    })

    describe('when used in the Temporary Accommodation service', () => {
      it('should render a stub Temporary Accommodation page', () => {
        ;(getService as jest.Mock).mockReturnValue('temporary-accommodation')

        const requestHandler = applicationController.index()

        requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/index')
      })
    })
  })
})
