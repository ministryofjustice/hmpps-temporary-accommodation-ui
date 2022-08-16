/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Controllers } from '../controllers'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const {
    applicationController,
    premisesController,
    bookingsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
  } = controllers

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', applicationController.index())

  get('/premises', premisesController.index())
  get('/premises/:id', premisesController.show())

  get('/premises/:premisesId/bookings/new', bookingsController.new())
  post('/premises/:premisesId/bookings', bookingsController.create())
  get('/premises/:premisesId/bookings/:bookingId/confirmation', bookingsController.confirm())

  get('/premises/:premisesId/bookings/:bookingId/arrivals/new', arrivalsController.new())
  post('/premises/:premisesId/bookings/:bookingId/arrivals', arrivalsController.create())
  post('/premises/:premisesId/bookings/:bookingId/nonArrivals', nonArrivalsController.create())

  get('/premises/:premisesId/bookings/:bookingId/departures/new', departuresController.new())
  post('/premises/:premisesId/bookings/:bookingId/departures', departuresController.create())
  get('/premises/:premisesId/bookings/:bookingId/departures/:departureId/confirmation', departuresController.confirm())

  return router
}
