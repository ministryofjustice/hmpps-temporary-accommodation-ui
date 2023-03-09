/* istanbul ignore file */

import { Services } from '../../../services'
import ArrivalsController from './arrivalsController'
import BedspacesController from './bedspacesController'
import BookingReportsController from './bookingReportsController'
import BookingsController from './bookingsController'
import CancellationsController from './cancellationsController'
import ConfirmationsController from './confirmationsController'
import DeparturesController from './departuresController'
import ExtensionsController from './extensionsController'
import PremisesController from './premisesController'
import LostBedsController from './lostBedsController'

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

  const bookingReportsController = new BookingReportsController(services.bookingReportService)

  const lostBedsController = new LostBedsController(
    services.lostBedService,
    services.premisesService,
    services.bedspaceService,
  )

  return {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
    bookingReportsController,
    lostBedsController,
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
  BookingReportsController,
  LostBedsController,
}
