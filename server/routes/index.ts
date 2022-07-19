import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

import PremisesController from '../controllers/premisesController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const premisesController = new PremisesController(services.premisesService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/premises', premisesController.index())

  return router
}
