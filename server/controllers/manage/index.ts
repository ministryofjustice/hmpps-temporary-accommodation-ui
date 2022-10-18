/* istanbul ignore file */

import PremisesController from './premisesController'
import BookingsController from './bookingsController'
import BookingExtensionsController from './bookingExtensionsController'
import ArrivalsController from './arrivalsController'
import NonArrivalsController from './nonArrivalsController'
import DeparturesController from './departuresController'
import CancellationsController from './cancellationsController'
import LostBedsController from './lostBedsController'
import PeopleController from '../peopleController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService, services.bookingService)
  const bookingsController = new BookingsController(
    services.bookingService,
    services.premisesService,
    services.personService,
  )
  const bookingExtensionsController = new BookingExtensionsController(services.bookingService)
  const arrivalsController = new ArrivalsController(services.arrivalService, services.premisesService)
  const nonArrivalsController = new NonArrivalsController(services.nonArrivalService)
  const departuresController = new DeparturesController(services.departureService, services.bookingService)
  const cancellationsController = new CancellationsController(services.cancellationService, services.bookingService)
  const lostBedsController = new LostBedsController(services.lostBedService)
  const peopleController = new PeopleController(services.personService)

  return {
    premisesController,
    bookingsController,
    bookingExtensionsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    lostBedsController,
    peopleController,
  }
}

export {
  PremisesController,
  BookingsController,
  BookingExtensionsController,
  ArrivalsController,
  NonArrivalsController,
  DeparturesController,
  PeopleController,
}
