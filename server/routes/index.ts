import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

import PremisesController from '../controllers/premisesController'
import BookingsController from '../controllers/bookingsController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const premisesController = new PremisesController(services.premisesService)
  const bookingsController = new BookingsController(services.bookingService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/premises', premisesController.index())
  get('/premises/:id', premisesController.show())

  get('/premises/:premisesId/booking/new', bookingsController.new())
  post('/premises/:premisesId/booking/new', bookingsController.create())

  return router
}
