import express, { Express } from 'express'
import request from 'supertest'
import { TemporaryAccommodationUserRole } from '@approved-premises/api'
import setUpMaintenancePageRedirect from './setUpMaintenancePageRedirect'
import config from '../config'

const setupApp = (roles: Array<TemporaryAccommodationUserRole> = []): Express => {
  const app = express()

  app.use((req, res, next) => {
    res.locals = res.locals || { placeContext: undefined }
    res.locals.user = res.locals.user || {}
    res.locals.user.roles = roles
    next()
  })

  app.use(setUpMaintenancePageRedirect())

  const appPaths = ['/known', '/maintenance', '/health', '/sign-in', '/sign-in/callback']

  appPaths.forEach(path => {
    app.get(path, (_req, res, _next) => {
      res.send(path.slice(1))
    })
  })

  return app
}

describe('setUpMaintenancePageRedirect', () => {
  let app: Express

  describe('when the IN_MAINTENANCE_MODE environment variable is set to false', () => {
    beforeEach(() => {
      config.flags.maintenanceMode = false
      app = setupApp()
    })

    it('should not redirect to the maintenance page', () => {
      return request(app).get('/known').expect(200)
    })

    it('should redirect requests to the maintenance page back to the dashboard', async () => {
      const response = await request(app).get('/maintenance').expect(302)
      expect(response.text).toContain('Found. Redirecting to /')
    })
  })

  describe('when the IN_MAINTENANCE_MODE environment variable is set to true', () => {
    beforeEach(() => {
      config.flags.maintenanceMode = true
      app = setupApp()
    })

    describe('and the requested page should be redirected', () => {
      it('should redirect to the maintenance page', async () => {
        const response = await request(app).get('/known').expect(302)
        expect(response.text).toContain('Found. Redirecting to /maintenance')
      })
    })

    describe('and the requested page should not be redirected', () => {
      it.each([
        ['health endpoint', '/health'],
        ['maintenance page', '/maintenance'],
        ['sign-in page', '/sign-in'],
        ['sign-in callback page', '/sign-in/callback'],
      ])('should not redirect requests for the %s at %s', (_, path) => {
        return request(app).get(path).expect(200)
      })
    })

    describe('when the user has the admin role', () => {
      beforeEach(() => {
        app = setupApp(['admin'])
      })

      it('should not redirect to the maintenance page', () => {
        return request(app).get('/known').expect(200)
      })
    })
  })
})
