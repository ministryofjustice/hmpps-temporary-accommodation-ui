/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../../controllers'
import { Services } from '../../services'
import actions from '../utils'

import manageRoutes from './manage'

export default function routes(controllers: Controllers, services: Services): Router {
  const router = Router()

  const { dashboardController, staticController } = controllers

  const { get } = actions(router, services.auditService)

  get('/', dashboardController.index(), { auditEvent: 'VIEW_DASHBOARD' })
  get('/cookies', staticController.cookies(), { auditEvent: 'VIEW_COOKIES' })

  manageRoutes(controllers, services, router)

  return router
}
