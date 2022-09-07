/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)
  const { applicationsController } = controllers
  get(paths.applications.new.pattern, applicationsController.new())
  return router
}
