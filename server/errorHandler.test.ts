import path from 'path'
import express, { type Express } from 'express'
import createError, { type HttpError } from 'http-errors'
import request from 'supertest'
import { UnauthorizedError } from './utils/errors'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'

const setupApp = (production: boolean, error: HttpError): Express => {
  const app = express()
  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.get('/known', (_req, res, _next) => {
    res.send('known')
  })

  app.get('/unauthorised', (_req, _res, next) => {
    next(new UnauthorizedError())
  })
  app.use((req, res, next) => next(error))
  app.use(errorHandler(production))

  return app
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    const app = setupApp(false, createError(404, 'Not found'))

    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    const app = setupApp(true, createError(404, 'Not found'))

    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not found')
      })
  })
})

describe('redirection on user not authorised', () => {
  it.each([
    [401, 'Unauthorised'],
    [403, 'Forbidden'],
  ])('should render the not authorised page when error is %p', (status: number, message: string) => {
    const app = setupApp(true, createError(status, message))

    return request(app)
      .get('/unauthorised')
      .expect(302)
      .expect(res => {
        expect(res.text).toContain('Redirecting to /not-authorised')
      })
  })
})
