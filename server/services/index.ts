/* istanbul ignore file */

import { dataAccess } from '../data'

import config from '../config'
import ApplicationService from './applicationService'
import ArrivalService from './arrivalService'
import AssessmentsService from './assessmentsService'
import AuditService from './auditService'
import BedspaceSearchService from './bedspaceSearchService'
import BedspaceService from './bedspaceService'
import BookingSearchService from './bookingSearchService'
import BookingService from './bookingService'
import CancellationService from './cancellationService'
import ConfirmationService from './confirmationService'
import DepartureService from './departureService'
import ExtensionService from './extensionService'
import LostBedService from './lostBedService'
import NonArrivalService from './nonArrivalService'
import PersonService from './personService'
import PremisesService from './premisesService'
import ReportService from './reportService'
import TurnaroundService from './turnaroundService'
import UserService from './userService'
import ReferenceDataService from './referenceDataService'

export const services = () => {
  const {
    premisesClientBuilder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClientBuilder,
    applicationClientBuilder,
    roomClientBuilder,
    reportClientBuilder,
    userClientBuilder,
    bedClientBuilder,
    assessmentClientBuilder,
  } = dataAccess()

  const userService = new UserService(userClientBuilder)
  const auditService = new AuditService(config.apis.audit)
  const premisesService = new PremisesService(premisesClientBuilder, referenceDataClientBuilder)
  const personService = new PersonService(personClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder, lostBedClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const nonArrivalService = new NonArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const applicationService = new ApplicationService(applicationClientBuilder)
  const bedspaceService = new BedspaceService(roomClientBuilder, referenceDataClientBuilder)
  const confirmationService = new ConfirmationService(bookingClientBuilder)
  const extensionService = new ExtensionService(bookingClientBuilder)
  const reportService = new ReportService(reportClientBuilder, referenceDataClientBuilder)
  const bedspaceSearchService = new BedspaceSearchService(bedClientBuilder, referenceDataClientBuilder)
  const bookingSearchService = new BookingSearchService(bookingClientBuilder)
  const turnaroundService = new TurnaroundService(bookingClientBuilder)
  const assessmentsService = new AssessmentsService(assessmentClientBuilder, referenceDataClientBuilder)
  const referenceDataService = new ReferenceDataService(referenceDataClientBuilder)

  return {
    userService,
    auditService,
    premisesService,
    personService,
    bookingService,
    arrivalService,
    nonArrivalService,
    departureService,
    cancellationService,
    lostBedService,
    applicationService,
    bedspaceService,
    confirmationService,
    extensionService,
    reportService,
    bedspaceSearchService,
    bookingSearchService,
    turnaroundService,
    assessmentsService,
    referenceDataService,
  }
}

export type Services = ReturnType<typeof services>

export {
  ApplicationService,
  ArrivalService,
  AssessmentsService,
  BedspaceService,
  BookingSearchService,
  BookingService,
  CancellationService,
  DepartureService,
  ExtensionService,
  LostBedService,
  NonArrivalService,
  PersonService,
  PremisesService,
  TurnaroundService,
  UserService,
  ReferenceDataService,
}
