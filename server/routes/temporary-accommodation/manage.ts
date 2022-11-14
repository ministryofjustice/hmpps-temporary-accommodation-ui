/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/manage'

import actions from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = actions(router)

  const { premisesController, bedspacesController, bookingsController } = controllers.temporaryAccommodation

  get(paths.premises.index.pattern, premisesController.index())
  get(paths.premises.new.pattern, premisesController.new())
  post(paths.premises.create.pattern, premisesController.create())
  get(paths.premises.edit.pattern, premisesController.edit())
  put(paths.premises.update.pattern, premisesController.update())
  get(paths.premises.show.pattern, premisesController.show())

  get(paths.premises.bedspaces.new.pattern, bedspacesController.new())
  post(paths.premises.bedspaces.create.pattern, bedspacesController.create())
  get(paths.premises.bedspaces.edit.pattern, bedspacesController.edit())
  put(paths.premises.bedspaces.update.pattern, bedspacesController.update())
  get(paths.premises.bedspaces.show.pattern, bedspacesController.show())

  get(paths.bookings.new.pattern, bookingsController.new())
  post(paths.bookings.create.pattern, bookingsController.create())

  return router
}
