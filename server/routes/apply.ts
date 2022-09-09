/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = actions(router)
  const { applicationsController, pagesController } = controllers

  get(paths.applications.new.pattern, applicationsController.new())
  post(paths.applications.create.pattern, applicationsController.create())
  get(paths.applications.index.pattern, applicationsController.index())

  get(paths.applications.pages.show.pattern, pagesController.show())
  put(paths.applications.pages.update.pattern, pagesController.update())

  return router
}
