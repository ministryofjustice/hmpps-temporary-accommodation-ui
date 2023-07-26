import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { userFactory } from '../testutils/factories'
import { UnauthorizedError } from '../utils/errors'
import { createRoleMiddleware } from './roleMiddleware'

describe('createRoleMiddleware', () => {
  it('returns middleware that calls the handler when the user has the required role', async () => {
    const handler = jest.fn()
    const request = createMock<Request>()
    const response = createMock<Response>({
      locals: {
        user: userFactory.build({
          roles: ['referrer'],
        }),
      },
    })
    const next = jest.fn()

    const middleware = createRoleMiddleware('referrer')

    middleware(handler)(request, response, next)

    expect(handler).toHaveBeenCalledWith(request, response, next)
  })

  it('returns middleware that calls next() with an error when the user does not have the required role', async () => {
    const handler = jest.fn()
    const request = createMock<Request>()
    const response = createMock<Response>({
      locals: {
        user: userFactory.build({
          roles: ['assessor'],
        }),
      },
    })
    const next = jest.fn()

    const middleware = createRoleMiddleware('referrer')
    middleware(handler)(request, response, next)

    expect(handler).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new UnauthorizedError())
  })
})
