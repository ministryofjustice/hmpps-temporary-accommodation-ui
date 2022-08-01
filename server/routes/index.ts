import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

import PremisesController from '../controllers/premisesController'
import BookingsController from '../controllers/bookingsController'
import ArrivalsController from '../controllers/arrivalsController'
import NonArrivalsController from '../controllers/nonArrivalsController'
import DeparturesController from '../controllers/departuresController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const premisesController = new PremisesController(services.premisesService, services.bookingService)
  const bookingsController = new BookingsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(services.departureService, services.premisesService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/premises', premisesController.index())
  get('/premises/:id', premisesController.show())

  get('/premises/:premisesId/bookings/new', bookingsController.new())
  post('/premises/:premisesId/bookings', bookingsController.create())
  get('/premises/:premisesId/bookings/:bookingId/confirmation', bookingsController.confirm())

  get('/premises/:premisesId/bookings/:bookingId/arrivals/new', arrivalsController.new())
  router.post('/premises/:premisesId/bookings/:bookingId/arrivals', arrivalsController.create())
  router.post('/premises/:premisesId/bookings/:bookingId/nonArrivals', nonArrivalsController.create())

  get('/premises/:premisesId/bookings/:bookingId/departures/new', departuresController.new())
  router.post('/premises/:premisesId/bookings/:bookingId/departures', departuresController.create())

  return router
}
