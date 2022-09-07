/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)
  const { applicationsController } = controllers
  const { applicationsController, pagesController } = controllers
  get(paths.applications.new.pattern, applicationsController.new())
  get(paths.applications.pages.show.pattern, pagesController.show())
  return router
}
