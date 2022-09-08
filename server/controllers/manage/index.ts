/* istanbul ignore file */

import PremisesController from './premisesController'
import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import ArrivalsController from './arrivalsController'
import NonArrivalsController from './nonArrivalsController'
import DeparturesController from './departuresController'
import CancellationsController from './cancellationsController'
import LostBedsController from './lostBedsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService, services.bookingService)
  const bookingsController = new BookingsController(services.bookingService, services.premisesService)
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(
    services.departureService,
    services.premisesService,
    services.bookingService,
  )
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)
  const lostBedsController = new LostBedsController(services.lostBedService)

  return {
    premisesController,
    bookingsController,
    bookingExtensionsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    lostBedsController,
  }
}

export {
  PremisesController,
  BookingsController,
  BookingExtensionsController,
  ArrivalsController,
  NonArrivalsController,
  DeparturesController,
}
