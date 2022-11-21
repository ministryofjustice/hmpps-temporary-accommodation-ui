/* istanbul ignore file */

import { Services } from '../../../services'
import PremisesController from './premisesController'
import BedspacesController from './bedspacesController'
import BookingsController from './bookingsController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(
    services.premisesService,
    services.bedspaceService,
    services.localAuthorityService,
  )
  const bedspacesController = new BedspacesController(services.premisesService, services.bedspaceService)
  const bookingsController = new BookingsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
  )

  return {
    premisesController,
    bedspacesController,
    bookingsController,
  }
}

export { PremisesController, BedspacesController, BookingsController }
