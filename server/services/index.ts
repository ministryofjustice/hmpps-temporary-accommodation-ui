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
import ApplicationService from './applicationService'
import LocalAuthorityService from './temporary-accommodation/localAuthorityService'

export const services = () => {
  const {
    hmppsAuthClient,
    approvedPremisesClientBuilder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClient,
    applicationClientBuilder,
    localAuthorityClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const personService = new PersonService(personClient)
  const bookingService = new BookingService(bookingClientBuilder, referenceDataClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const nonArrivalService = new NonArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const applicationService = new ApplicationService(applicationClientBuilder)
  const localAuthorityService = new LocalAuthorityService(localAuthorityClientBuilder)

  return {
    userService,
    premisesService,
    personService,
    bookingService,
    arrivalService,
    nonArrivalService,
    departureService,
    cancellationService,
    lostBedService,
    applicationService,
    localAuthorityService,
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
  CancellationService,
  BookingService,
  LostBedService,
  ApplicationService,
  LocalAuthorityService,
}
