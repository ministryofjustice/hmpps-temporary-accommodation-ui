/* istanbul ignore file */

import ApplicationController from './applicationController'
import PremisesController from './premisesController'
import BookingsController from './bookingsController'
import ArrivalsController from './arrivalsController'
import NonArrivalsController from './nonArrivalsController'
import DeparturesController from './departuresController'
import CancellationsController from './cancellationsController'

import type { Services } from '../services'

export const controllers = (services: Services) => {
  const applicationController = new ApplicationController()
  const premisesController = new PremisesController(services.premisesService, services.bookingService)
  const bookingsController = new BookingsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(
    services.departureService,
    services.premisesService,
    services.bookingService,
  )
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)

  return {
    applicationController,
    premisesController,
    bookingsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
  }
}

export type Controllers = ReturnType<typeof controllers>

export { PremisesController, BookingsController, ArrivalsController, NonArrivalsController, DeparturesController }
