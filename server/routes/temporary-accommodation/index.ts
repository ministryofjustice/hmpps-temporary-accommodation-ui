/* istanbul ignore file */

import { Router } from 'express'
import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/static'
import { Services } from '../../services'
import actions from '../utils'

import config from '../../config'
import applyRoutes from '../apply'
import manageRoutes from './manage'

export default function routes(controllers: Controllers, services: Services): Router {
  const router = Router()

  const { dashboardController, staticController } = controllers

  const { get } = actions(router, services.auditService)

  get('/', dashboardController.index(), { auditEvent: 'VIEW_DASHBOARD' })
  get(paths.static.cookies.pattern, staticController.cookies(), { auditEvent: 'VIEW_COOKIES' })

  manageRoutes(controllers, services, router)

  if (!config.flags.applyDisabled) {
    applyRoutes(controllers, services, router)
  }

  return router
}
