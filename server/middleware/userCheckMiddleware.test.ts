import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { userFactory } from '../testutils/factories'
import { UnauthorizedError } from '../utils/errors'
import { TemporaryAccommodationUserRole, TemporaryAccommodationUser as User } from '../@types/shared'
import { createUserCheckMiddleware, userIsAuthorisedForManage } from './userCheckMiddleware'
import paths from '../paths/temporary-accommodation/manage'

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

  describe('userIsAuthorisedForManage', () => {
    it('returns middleware that calls next() with an unauthorized error when the path is not reports', async () => {
      const handler = jest.fn()
      const request = createMock<Request>({ path: paths.assessments.index({}) })
      const response = createMock<Response>({
        locals: {
          user: userFactory.build({ roles: ['referrer'] }),
        },
      })
      const next = jest.fn()

      const middleware = createUserCheckMiddleware(userIsAuthorisedForManage)

      middleware(handler)(request, response, next)

      expect(handler).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(new UnauthorizedError())
    })

    describe('when the user has assessor role', () => {
      it('returns middleware that calls the handler', async () => {
        const handler = jest.fn()
        const request = createMock<Request>({ path: paths.assessments.index({}) })
        const response = createMock<Response>({
          locals: {
            user: userFactory.build({ roles: ['assessor'] }),
          },
        })
        const next = jest.fn()

        const middleware = createUserCheckMiddleware(userIsAuthorisedForManage)

        middleware(handler)(request, response, next)

        expect(handler).toHaveBeenCalledWith(request, response, next)
      })
    })

    describe('when the user has reporter role', () => {
      it('returns middleware that calls the handler when the the path is reports#new', async () => {
        const handler = jest.fn()
        const request = createMock<Request>({ path: paths.reports.new({}) })
        const response = createMock<Response>({
          locals: {
            user: userFactory.build({ roles: ['reporter' as TemporaryAccommodationUserRole] }),
          },
        })
        const next = jest.fn()

        const middleware = createUserCheckMiddleware(userIsAuthorisedForManage)

        middleware(handler)(request, response, next)

        expect(handler).toHaveBeenCalledWith(request, response, next)
      })

      it('returns middleware that calls the handler when the path is reports#create', async () => {
        const handler = jest.fn()
        const request = createMock<Request>({ path: paths.reports.create({}) })
        const response = createMock<Response>({
          locals: {
            user: userFactory.build({ roles: ['reporter' as TemporaryAccommodationUserRole] }),
          },
        })
        const next = jest.fn()

        const middleware = createUserCheckMiddleware(userIsAuthorisedForManage)

        middleware(handler)(request, response, next)

        expect(handler).toHaveBeenCalledWith(request, response, next)
      })

      it('returns middleware that calls next() with an unauthorized error when the path is not reports', async () => {
        const handler = jest.fn()
        const request = createMock<Request>({ path: paths.assessments.index({}) })
        const response = createMock<Response>({
          locals: {
            user: userFactory.build({ roles: ['reporter' as TemporaryAccommodationUserRole] }),
          },
        })
        const next = jest.fn()

        const middleware = createUserCheckMiddleware(userIsAuthorisedForManage)

        middleware(handler)(request, response, next)

        expect(handler).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(new UnauthorizedError())
      })
    })
  })
})
