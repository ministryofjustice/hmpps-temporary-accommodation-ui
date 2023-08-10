import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { userFactory } from '../testutils/factories'
import { UnauthorizedError } from '../utils/errors'
import { TemporaryAccommodationUser as User } from '../@types/shared'
import { createUserCheckMiddleware } from './userCheckMiddleware'

describe('createUserCheckMiddleware', () => {
  it('returns middleware that calls the handler when the user predicate succeeds', async () => {
    const handler = jest.fn()
    const request = createMock<Request>()
    const response = createMock<Response>({
      locals: {
        user: userFactory.build(),
      },
    })
    const next = jest.fn()
    const success = (_user: User) => {
      return true
    }

    const middleware = createUserCheckMiddleware(success)

    middleware(handler)(request, response, next)

    expect(handler).toHaveBeenCalledWith(request, response, next)
  })

  it('returns middleware that calls next() when the user predicate fails', async () => {
    const handler = jest.fn()
    const request = createMock<Request>()
    const response = createMock<Response>({
      locals: {
        user: userFactory.build(),
      },
    })
    const next = jest.fn()
    const failure = (_user: User) => {
      return false
    }

    const middleware = createUserCheckMiddleware(failure)
    middleware(handler)(request, response, next)

    expect(handler).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new UnauthorizedError())
  })
})
