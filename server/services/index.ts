/* istanbul ignore file */

import { dataAccess } from '../data'

import config from '../config'
import ApplicationService from './applicationService'
import ArrivalService from './arrivalService'
import AssessmentsService from './assessmentsService'
import AuditService from './auditService'
import BedspaceSearchService from './bedspaceSearchService'
import BedspaceService from './bedspaceService'
import BedspaceServiceV2 from './v2/bedspaceService'
import BookingSearchService from './bookingSearchService'
import BookingService from './bookingService'
import CancellationService from './cancellationService'
import ConfirmationService from './confirmationService'
import DepartureService from './departureService'
import ExtensionService from './extensionService'
import LostBedService from './lostBedService'
import PersonService from './personService'
import PremisesService from './premisesService'
import PremisesServiceV2 from './v2/premisesService'
import ReportService from './reportService'
import TurnaroundService from './turnaroundService'
import TimelineService from './assessments/timelineService'
import UserService from './userService'
import ReferenceDataService from './referenceDataService'

export const services = () => {
  const {
    premisesClientBuilder,
    premisesClientV2Builder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClientBuilder,
    applicationClientBuilder,
    roomClientBuilder,
    reportClientBuilder,
    userClientBuilder,
    bedspaceClientBuilder,
    bedspaceClientV2Builder,
    assessmentClientBuilder,
    timelineClientBuilder,
  } = dataAccess()

  const userService = new UserService(userClientBuilder)
  const auditService = new AuditService(config.apis.audit)
  const premisesService = new PremisesService(premisesClientBuilder, referenceDataClientBuilder)
  const premisesServiceV2 = new PremisesServiceV2(premisesClientV2Builder)
  const personService = new PersonService(personClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder, lostBedClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const applicationService = new ApplicationService(applicationClientBuilder)
  const bedspaceService = new BedspaceService(roomClientBuilder, referenceDataClientBuilder)
  const bedspaceServiceV2 = new BedspaceServiceV2(bedspaceClientV2Builder, referenceDataClientBuilder)
  const confirmationService = new ConfirmationService(bookingClientBuilder)
  const extensionService = new ExtensionService(bookingClientBuilder)
  const reportService = new ReportService(reportClientBuilder, referenceDataClientBuilder)
  const bedspaceSearchService = new BedspaceSearchService(bedspaceClientBuilder, referenceDataClientBuilder)
  const bookingSearchService = new BookingSearchService(bookingClientBuilder)
  const turnaroundService = new TurnaroundService(bookingClientBuilder)
  const assessmentsService = new AssessmentsService(assessmentClientBuilder, referenceDataClientBuilder)
  const referenceDataService = new ReferenceDataService(referenceDataClientBuilder)
  const timelineService = new TimelineService(timelineClientBuilder)

  return {
    userService,
    auditService,
    premisesService,
    personService,
    bookingService,
    arrivalService,
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
    timelineService,
    v2: {
      premisesService: premisesServiceV2,
      bedspaceService: bedspaceServiceV2,
    },
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
  PersonService,
  PremisesService,
  PremisesServiceV2,
  TurnaroundService,
  UserService,
  ReferenceDataService,
  TimelineService,
}
