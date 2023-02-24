import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import express from 'express'
import applicationVersion from '../applicationVersion'
import config from '../config'

export function setUpSentryRequestHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    // Prevent usernames which are PII from being sent to Sentry
    // https://docs.sentry.io/platforms/python/guides/logging/data-management/sensitive-data/#examples
    const anonymousId = Math.random().toString()
    Sentry.setUser({ id: anonymousId, username: anonymousId })

    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: applicationVersion.gitRef,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
      ],
      tracesSampler: samplingContext => {
        const transactionName = samplingContext?.transactionContext?.name
        if (
          transactionName?.includes('ping') ||
          transactionName?.includes('health') ||
          transactionName?.includes('assets')
        ) {
          return 0
        }

        if (config.environment === 'prod') {
          return 1
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
    app.use(Sentry.Handlers.tracingHandler())
  }
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)
  }
}
