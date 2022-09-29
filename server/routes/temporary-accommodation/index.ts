/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../../controllers'
import actions from '../utils'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const { applicationController } = controllers

  const { get } = actions(router)

  get('/', applicationController.index())

  return router
}
