import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'

export const services = () => {
  const { hmppsAuthClient, approvedPremisesClientBuilder, bookingClientBuilder, arrivalClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(arrivalClientBuilder)

  return {
    userService,
    premisesService,
    bookingService,
    arrivalService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PremisesService, ArrivalService }
