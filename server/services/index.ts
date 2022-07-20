import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'
import BookingService from './bookingService'

export const services = () => {
  const { hmppsAuthClient, approvedPremisesClientBuilder, bookingClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const bookingService = new BookingService(bookingClientBuilder)

  return {
    userService,
    premisesService,
    bookingService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PremisesService }
