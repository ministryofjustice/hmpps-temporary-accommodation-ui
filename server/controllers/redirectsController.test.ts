import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import RedirectsController from './redirectsController'

describe('RedirectController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let redirectsController: RedirectsController

  beforeEach(() => {
    redirectsController = new RedirectsController()
  })

  it('should redirect to any given URL with a status code of 301', () => {
    const requestHandler = redirectsController.redirect('https://www.google.com', 301)
    requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith(301, 'https://www.google.com')
  })
})
