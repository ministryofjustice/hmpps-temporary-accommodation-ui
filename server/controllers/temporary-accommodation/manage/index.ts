/* istanbul ignore file */

import { Services } from '../../../services'
import PremisesController from './premisesController'
import BedspacesController from './bedspacesController'
import BookingsController from './bookingsController'
import ConfirmationsController from './confirmationsController'
import ArrivalsController from './arrivalsController'
import DeparturesController from './departuresController'
import ExtensionsController from './extensionsController'
import CancellationsController from './cancellationsController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService, services.bedspaceService)
  const bedspacesController = new BedspacesController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
  )
  const bookingsController = new BookingsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
  )

  const confirmationsController = new ConfirmationsController(services.bookingService, services.confirmationService)
  const arrivalsController = new ArrivalsController(services.bookingService, services.arrivalService)
  const departuresController = new DeparturesController(services.bookingService, services.departureService)
  const extensionsController = new ExtensionsController(services.bookingService, services.extensionService)
  const cancellationsController = new CancellationsController(services.bookingService, services.cancellationService)

  return {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
  }
}

export {
  PremisesController,
  BedspacesController,
  BookingsController,
  ConfirmationsController,
  ArrivalsController,
  ExtensionsController,
  CancellationsController,
}
