/* istanbul ignore file */

import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'
import NonArrivalService from './nonArrivalService'
import DepartureService from './departureService'
import CancellationService from './cancellationService'
import LostBedService from './lostBedService'

export const services = () => {
  const {
    hmppsAuthClient,
    approvedPremisesClientBuilder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const nonArrivalService = new NonArrivalService(bookingClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)

  return {
    userService,
    premisesService,
    bookingService,
    arrivalService,
    nonArrivalService,
    departureService,
    cancellationService,
    lostBedService,
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
  LostBedService,
}
