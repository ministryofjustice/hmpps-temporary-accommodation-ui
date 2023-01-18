/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/manage'
import { Services } from '../../services'

import actions from '../utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { get, post, put } = actions(router, services.auditService)

  const {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
    bookingReportsController,
  } = controllers.temporaryAccommodation

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
  get(paths.bookings.show.pattern, bookingsController.show())
  get(paths.bookings.history.pattern, bookingsController.history())

  get(paths.bookings.confirmations.new.pattern, confirmationsController.new())
  post(paths.bookings.confirmations.create.pattern, confirmationsController.create())

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new())
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create())

  get(paths.bookings.departures.new.pattern, departuresController.new())
  post(paths.bookings.departures.create.pattern, departuresController.create())

  get(paths.bookings.extensions.new.pattern, extensionsController.new())
  post(paths.bookings.extensions.create.pattern, extensionsController.create())

  get(paths.bookings.cancellations.new.pattern, cancellationsController.new())
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create())

  get(paths.reports.bookings.new.pattern, bookingReportsController.new())
  post(paths.reports.bookings.create.pattern, bookingReportsController.create())

  return router
}
