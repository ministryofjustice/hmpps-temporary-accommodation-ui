import express, { Express } from 'express'
import request from 'supertest'
import { TemporaryAccommodationUserRole } from '@approved-premises/api'
import setUpMaintenancePageRedirect from './setUpMaintenancePageRedirect'
import config from '../config'

const setupApp = (roles: Array<TemporaryAccommodationUserRole> = []): Express => {
  const app = express()

  app.use((req, res, next) => {
    res.locals.user = res.locals.user || {}
    res.locals.user.roles = roles
    next()
  })

  app.use(setUpMaintenancePageRedirect())

  const appPaths = ['/dashboard', '/sign-in', '/sign-in/callback', '/health', '/maintenance']

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
      return request(app).get('/dashboard').expect(200)
    })
  })

  describe('when the IN_MAINTENANCE_MODE environment variable is set to true', () => {
    beforeEach(() => {
      config.flags.maintenanceMode = true
      app = setupApp()
    })

    it('should redirect to the maintenance page', async () => {
      const response = await request(app).get('/dashboard').expect(302)
      expect(response.text).toContain('Found. Redirecting to /maintenance')
    })

    it.each([['/health'], ['/maintenance'], ['/sign-in'], ['/sign-in/callback']])(
      'should not redirect requests for %s to the maintenance page',
      async (path: string) => {
        return request(app).get(path).expect(200)
      },
    )

    it('should not redirect users with the admin role', async () => {
      app = setupApp(['admin'])

      return request(app).get('/dashboard').expect(200)
    })
  })
})
