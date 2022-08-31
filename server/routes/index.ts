/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Controllers } from '../controllers'
import paths from '../paths'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const {
    applicationController,
    premisesController,
    bookingsController,
    bookingExtensionsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    lostBedsController,
  } = controllers

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', applicationController.index())

  get(paths.premises.index.pattern, premisesController.index())
  get(paths.premises.show.pattern, premisesController.show())

  get(paths.bookings.new.pattern, bookingsController.new())
  get(paths.bookings.show.pattern, bookingsController.show())
  post(paths.bookings.create.pattern, bookingsController.create())
  get(paths.bookings.confirm.pattern, bookingsController.confirm())

  get(paths.bookings.extensions.new.pattern, bookingExtensionsController.new())
  post(paths.bookings.extensions.create.pattern, bookingExtensionsController.create())
  get(paths.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new())
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create())

  post(paths.bookings.nonArrivals.create.pattern, nonArrivalsController.create())

  get(paths.bookings.cancellations.new.pattern, cancellationsController.new())
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create())
  get(paths.bookings.cancellations.confirm.pattern, cancellationsController.confirm())

  get(paths.bookings.departures.new.pattern, departuresController.new())
  post(paths.bookings.departures.create.pattern, departuresController.create())
  get(paths.bookings.departures.confirm.pattern, departuresController.confirm())

  get(paths.lostBeds.new.pattern, lostBedsController.new())
  post(paths.lostBeds.create.pattern, lostBedsController.create())

  return router
}
