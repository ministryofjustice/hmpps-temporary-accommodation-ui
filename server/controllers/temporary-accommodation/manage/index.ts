/* istanbul ignore file */

import { Services } from '../../../services'
import PremisesController from './premisesController'
import BedspacesController from './bedspacesController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(
    services.premisesService,
    services.bedspaceService,
    services.localAuthorityService,
  )
  const bedspacesController = new BedspacesController(services.premisesService, services.bedspaceService)

  return {
    premisesController,
    bedspacesController,
  }
}

export { PremisesController, BedspacesController }
