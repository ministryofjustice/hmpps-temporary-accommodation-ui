/* istanbul ignore file */

import { Router } from 'express'
import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/static'
import { Services } from '../../services'
import { actions } from '../utils'

import applyRoutes from '../apply'
import manageRoutes from './manage'

export default function routes(controllers: Controllers, services: Services): Router {
  const router = Router()

  const { landingController, staticController } = controllers

  const { get } = actions(router, services.auditService)

  get('/', landingController.index(), { auditEvent: 'VIEW_LANDING' })
  get(paths.static.cookies.pattern, staticController.cookies(), { auditEvent: 'VIEW_COOKIES' })
  get(paths.static.useNDelius.pattern, staticController.useNDelius(), { auditEvent: 'VIEW_USE_NDELIUS' })
  get(paths.static.notAuthorised.pattern, staticController.notAuthorised(), { auditEvent: 'VIEW_NOT_AUTHORISED' })

  manageRoutes(controllers, services, router)
  applyRoutes(controllers, services, router)

  return router
}
