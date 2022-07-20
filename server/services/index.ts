import { dataAccess } from '../data'

import UserService from './userService'
import PremisesService from './premisesService'

export const services = () => {
  const data = dataAccess()

  const userService = new UserService(data.hmppsAuthClient)
  const premisesService = new PremisesService(data.approvedPremisesClientBuilder)

  return {
    userService,
    premisesService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PremisesService }
