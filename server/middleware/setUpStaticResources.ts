import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  Array.of(
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    '/node_modules/govuk-frontend/dist',
    '/node_modules/govuk-frontend/dist/govuk/assets',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
  ).forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of(
    '/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.css',
    '/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.css.map',
  ).forEach(file => {
    router.use(`/assets/css/${path.basename(file)}`, express.static(path.join(process.cwd(), file), cacheControl))
  })

  Array.of(
    '/node_modules/jquery/dist/jquery.min.js',
    '/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
    '/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js.map',
  ).forEach(file => {
    router.use(`/assets/js/${path.basename(file)}`, express.static(path.join(process.cwd(), file), cacheControl))
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
