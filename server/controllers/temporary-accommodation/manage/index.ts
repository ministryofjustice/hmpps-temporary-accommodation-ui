/* istanbul ignore file */

import { Services } from '../../../services'
import PremisesController from './premisesController'
import BedspacesController from './bedspacesController'
import BookingsController from './bookingsController'
import ConfirmationsController from './confirmationsController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(
    services.premisesService,
    services.bedspaceService,
    services.localAuthorityService,
  )
  const bedspacesController = new BedspacesController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
  )
  const bookingsController = new BookingsController(
    services.premisesService,
    services.bedspaceService,
    services.bookingService,
  )

  const confirmationsController = new ConfirmationsController(services.bookingService, services.confirmationService)

  return {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
  }
}

export { PremisesController, BedspacesController, BookingsController, ConfirmationsController }
