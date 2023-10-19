import express, { Express } from 'express'
import request from 'supertest'
import setUpDomainRedirect from './setUpDomainRedirect'
import config from '../config'

jest.mock('../config', () => ({
  secondDomain: 'http://example.com',
  firstDomain: 'http://example.org',
}))

const setupApp = (): Express => {
  const app = express()
  app.use(setUpDomainRedirect())

  app.get('/known', (_req, res, _next) => {
    res.send('known')
  })

  return app
}
describe('setUpDomainRedirect', () => {
  it('should redirect to the target domain when in test mode', () => {
    config.environment = 'test'
    const app = setupApp()
    const targetHost = new URL(config.firstDomain).host
    return request(app).get('/known').set('host', targetHost).expect(301)
  })

  it('should not redirect requests already coming from the second domain', () => {
    config.environment = 'test'
    const app = setupApp()
    const targetHost = new URL(config.secondDomain).host
    return request(app).get('/known').set('host', targetHost).expect(200)
  })

  it('should not redirect when not in test mode', () => {
    config.environment = 'production'
    const app = setupApp()
    const targetHost = new URL(config.firstDomain).host
    return request(app).get('/known').set('host', targetHost).expect(200)
  })

  afterEach(() => {
    config.environment = 'test'
  })
})
