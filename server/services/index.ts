/* istanbul ignore file */

import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import PersonService from './personService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'
import NonArrivalService from './nonArrivalService'
import DepartureService from './departureService'
import CancellationService from './cancellationService'
import LostBedService from './lostBedService'
import BedspaceService from './bedspaceService'
import ConfirmationService from './confirmationService'
import ExtensionService from './extensionService'
import BookingReportService from './bookingReportService'
import AuditService from './auditService'
import config from '../config'

export const services = () => {
  const {
    hmppsAuthClient,
    premisesClientBuilder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClient,
    roomClientBuilder,
    reportClientBuilder,
    userClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient, userClientBuilder)
  const auditService = new AuditService(config.apis.audit)
  const premisesService = new PremisesService(premisesClientBuilder, referenceDataClientBuilder)
  const personService = new PersonService(personClient)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const nonArrivalService = new NonArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const bedspaceService = new BedspaceService(roomClientBuilder, referenceDataClientBuilder)
  const confirmationService = new ConfirmationService(bookingClientBuilder)
  const extensionService = new ExtensionService(bookingClientBuilder)
  const bookingReportService = new BookingReportService(reportClientBuilder, referenceDataClientBuilder)

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
    bedspaceService,
    confirmationService,
    extensionService,
    bookingReportService,
  }
}

export type Services = ReturnType<typeof services>

export {
  UserService,
  PremisesService,
  PersonService,
  ArrivalService,
  NonArrivalService,
  DepartureService,
  ExtensionService,
  CancellationService,
  BookingService,
  LostBedService,
}
