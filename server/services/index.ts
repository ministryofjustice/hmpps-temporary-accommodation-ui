/* istanbul ignore file */

import { dataAccess } from '../data'

import config from '../config'
import ApplicationService from './applicationService'
import ArrivalService from './arrivalService'
import AssessmentsService from './assessmentsService'
import AuditService from './auditService'
import BedspaceSearchService from './bedspaceSearchService'
import BedspaceService from './v2/bedspaceService'
import BookingSearchService from './bookingSearchService'
import BookingService from './bookingService'
import CancellationService from './cancellationService'
import ConfirmationService from './confirmationService'
import DepartureService from './departureService'
import ExtensionService from './extensionService'
import LostBedService from './lostBedService'
import PersonService from './personService'
import PremisesService from './v2/premisesService'
import ReportService from './reportService'
import TurnaroundService from './turnaroundService'
import TimelineService from './assessments/timelineService'
import UserService from './userService'
import ReferenceDataService from './referenceDataService'

export const services = () => {
  const {
    premisesClientV2Builder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClientBuilder,
    applicationClientBuilder,
    reportClientBuilder,
    userClientBuilder,
    bedspaceClientV2Builder,
    assessmentClientBuilder,
    timelineClientBuilder,
  } = dataAccess()

  const userService = new UserService(userClientBuilder)
  const auditService = new AuditService(config.apis.audit)
  const premisesService = new PremisesService(premisesClientV2Builder, referenceDataClientBuilder)
  const personService = new PersonService(personClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder, lostBedClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const applicationService = new ApplicationService(applicationClientBuilder)
  const bedspaceService = new BedspaceService(bedspaceClientV2Builder, referenceDataClientBuilder)
  const confirmationService = new ConfirmationService(bookingClientBuilder)
  const extensionService = new ExtensionService(bookingClientBuilder)
  const reportService = new ReportService(reportClientBuilder, referenceDataClientBuilder)
  const bedspaceSearchService = new BedspaceSearchService(bedspaceClientV2Builder, referenceDataClientBuilder)
  const bookingSearchService = new BookingSearchService(bookingClientBuilder)
  const turnaroundService = new TurnaroundService(bookingClientBuilder)
  const assessmentsService = new AssessmentsService(assessmentClientBuilder, referenceDataClientBuilder)
  const referenceDataService = new ReferenceDataService(referenceDataClientBuilder)
  const timelineService = new TimelineService(timelineClientBuilder)

  return {
    userService,
    auditService,
    personService,
    bookingService,
    arrivalService,
    departureService,
    cancellationService,
    lostBedService,
    applicationService,
    confirmationService,
    extensionService,
    reportService,
    bedspaceSearchService,
    bookingSearchService,
    turnaroundService,
    assessmentsService,
    referenceDataService,
    timelineService,
    premisesService,
    bedspaceService,
  }
}

export type Services = ReturnType<typeof services>

export {
  ApplicationService,
  ArrivalService,
  AssessmentsService,
  BookingSearchService,
  BookingService,
  CancellationService,
  DepartureService,
  ExtensionService,
  LostBedService,
  PersonService,
  PremisesService,
  TurnaroundService,
  UserService,
  ReferenceDataService,
  TimelineService,
}
