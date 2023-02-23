import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import express from 'express'
import applicationVersion from '../applicationVersion'
import config from '../config'

export function setUpSentryRequestHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: applicationVersion.gitRef,
      tracesSampler: samplingContext => {
        const transactionName = samplingContext?.transactionContext?.name

        if (transactionName?.includes('ping') || transactionName?.includes('health')) {
          return 0
        }

        if (config.environment === 'prod') {
          return 1.0
        }

        // Default sample rate
        return 0.05
      },
    })
    app.use(
      Sentry.Handlers.requestHandler({
        ip: false,
        user: false,
      }) as express.RequestHandler,
    )
  }
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)
  }
}
