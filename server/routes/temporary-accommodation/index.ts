/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../../controllers'
import { temporaryAccommodationPath } from '../../paths/service'
import actions from '../utils'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const { applicationController } = controllers

  const { get } = actions(router)

  get('/', applicationController.index())
  get(temporaryAccommodationPath.pattern, applicationController.index())

  return router
}
