/* istanbul ignore file */

import { Services } from '../../../services'
import ArrivalsController from './arrivalsController'
import BedspacesController from './bedspacesController'
import BedspaceSearchController from './bedspaceSearchController'
import ReportsController from './reportsController'
import BookingsController from './bookingsController'
import CancellationsController from './cancellationsController'
import ConfirmationsController from './confirmationsController'
import DeparturesController from './departuresController'
import ExtensionsController from './extensionsController'
import LostBedsController from './lostBedsController'
import PremisesController from './premisesController'
import BookingSearchController from './bookingSearchController'
import TurnaroundsController from './turnaroundsController'

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
    services.personService,
  )

  const confirmationsController = new ConfirmationsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.confirmationService,
  )
  const arrivalsController = new ArrivalsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.arrivalService,
  )
  const departuresController = new DeparturesController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.departureService,
  )
  const extensionsController = new ExtensionsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.extensionService,
  )
  const cancellationsController = new CancellationsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.cancellationService,
  )
  const turnaroundsController = new TurnaroundsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
    services.turnaroundService,
  )

  const reportsController = new ReportsController(services.reportService)

  const lostBedsController = new LostBedsController(
    services.lostBedService,
    services.premisesService,
    services.bedspaceService,
  )

  const bedspaceSearchController = new BedspaceSearchController(services.bedspaceSearchService)
  const bookingSearchController = new BookingSearchController(services.bookingSearchService)

  return {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
    turnaroundsController,
    reportsController,
    lostBedsController,
    bedspaceSearchController,
    bookingSearchController,
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
  TurnaroundsController,
  ReportsController,
  LostBedsController,
  BedspaceSearchController,
  BookingSearchController,
}
