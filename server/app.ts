/* istanbul ignore file */
import path from 'path'
import express from 'express'
import flash from 'connect-flash'

import createError from 'http-errors'
import methodOverride from 'method-override'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import { metricsMiddleware } from './monitoring/metricsApp'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import { setUpSentryErrorHandler, setUpSentryRequestHandler } from './middleware/setUpSentry'

import routes from './routes/temporary-accommodation'
import type { Controllers } from './controllers'
import type { Services } from './services'
import setUpDomainRedirect from './middleware/setUpDomainRedirect'
import config from './config'

export default function createApp(controllers: Controllers, services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  setUpSentryRequestHandler(app)

  if (config.environment !== 'local') {
    app.use(setUpDomainRedirect())
  }

  // Add method-override to allow us to use PUT and DELETE methods
  app.use(methodOverride('_method'))

  app.use(appInsightsMiddleware())
  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())

  app.use(flash())
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser(services))
  nunjucksSetup(app, path)
  app.use((req, res, next) => {
    res.locals.infoMessages = req.flash('info')
    res.locals.successMessages = req.flash('success')
    return next()
  })

  app.use(routes(controllers, services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  setUpSentryErrorHandler(app)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
