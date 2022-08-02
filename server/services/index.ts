/* istanbul ignore file */

import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'
import NonArrivalService from './nonArrivalService'

export const services = () => {
  const {
    hmppsAuthClient,
    approvedPremisesClientBuilder,
    bookingClientBuilder,
    arrivalClientBuilder,
    nonArrivalClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(arrivalClientBuilder)
  const nonArrivalService = new NonArrivalService(nonArrivalClientBuilder)

  return {
    userService,
    premisesService,
    bookingService,
    arrivalService,
    nonArrivalService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PremisesService, ArrivalService, NonArrivalService }
