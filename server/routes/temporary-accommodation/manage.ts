/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../../controllers'

export default function routes(_controllers: Controllers, router: Router): Router {
  return router
}
