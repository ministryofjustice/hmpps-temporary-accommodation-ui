/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../../controllers'
import actions from '../utils'

import manageRoutes from './manage'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const { dashboardController } = controllers

  const { get } = actions(router)

  get('/', dashboardController.index())

  manageRoutes(controllers, router)

  return router
}
