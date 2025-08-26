/* istanbul ignore file */

import { Services } from '../../../services'
import ArrivalsController from './arrivalsController'
import AssessmentsController from './assessmentsController'
import BedspaceSearchController from './bedspaceSearchController'
import BookingSearchController from './bookingSearchController'
import BookingsController from './bookingsController'
import CancellationsController from './cancellationsController'
import ConfirmationsController from './confirmationsController'
import DashboardController from './dashboardController'
import DeparturesController from './departuresController'
import ExtensionsController from './extensionsController'
import LostBedsController from './lostBedsController'
import ReportsController from './reportsController'
import TurnaroundsController from './turnaroundsController'
import PremisesControllerV2 from './v2/premisesController'
import BedspacesControllerV2 from './v2/bedspacesController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const premisesControllerV2 = new PremisesControllerV2(
    services.v2.premisesService,
    services.v2.bedspaceService,
    services.assessmentsService,
  )
  const bedspacesControllerV2 = new BedspacesControllerV2(
    services.v2.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.assessmentsService,
  )
  const bookingsController = new BookingsController(
    services.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.personService,
    services.assessmentsService,
  )

  const confirmationsController = new ConfirmationsController(
    services.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.confirmationService,
  )
  const arrivalsController = new ArrivalsController(
    services.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.arrivalService,
  )
  const departuresController = new DeparturesController(
    services.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.departureService,
  )
  const extensionsController = new ExtensionsController(
    services.premisesService,
    services.v2.bedspaceService,
    services.bookingService,
    services.extensionService,
  )
  const cancellationsController = new CancellationsController(
    services.premisesService,
    services.v2.bedspaceService,
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
    services.assessmentsService,
  )

  const bedspaceSearchController = new BedspaceSearchController(
    services.bedspaceSearchService,
    services.assessmentsService,
  )
  const bookingSearchController = new BookingSearchController(services.bookingSearchService)

  const assessmentsController = new AssessmentsController(services.assessmentsService, services.timelineService)

  return {
    dashboardController,
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
    assessmentsController,
    v2: {
      premisesController: premisesControllerV2,
      bedspacesController: bedspacesControllerV2,
    },
  }
}

export {
  ArrivalsController,
  AssessmentsController,
  BedspaceSearchController,
  BookingSearchController,
  BookingsController,
  CancellationsController,
  ConfirmationsController,
  DashboardController,
  ExtensionsController,
  LostBedsController,
  ReportsController,
  TurnaroundsController,
}
