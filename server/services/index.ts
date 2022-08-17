/* istanbul ignore file */

import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'
import NonArrivalService from './nonArrivalService'
import DepartureService from './departureService'
import CancellationService from './cancellationService'

export const services = () => {
  const {
    hmppsAuthClient,
    approvedPremisesClientBuilder,
    bookingClientBuilder,
    arrivalClientBuilder,
    nonArrivalClientBuilder,
    departureClientBuilder,
    referenceDataClientBuilder,
    cancellationClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(arrivalClientBuilder)
  const nonArrivalService = new NonArrivalService(nonArrivalClientBuilder)
  const departureService = new DepartureService(departureClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(cancellationClientBuilder, referenceDataClientBuilder)

  return {
    userService,
    premisesService,
    bookingService,
    arrivalService,
    nonArrivalService,
    departureService,
    cancellationService,
  }
}

export type Services = ReturnType<typeof services>

export {
  UserService,
  PremisesService,
  ArrivalService,
  NonArrivalService,
  DepartureService,
  CancellationService,
  BookingService,
}
