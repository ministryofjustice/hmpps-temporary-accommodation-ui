/* istanbul ignore file */

import { Services } from '../../../services'
import PremisesController from './premisesController'

export const controllers = (services: Services) => {
  const premisesController = new PremisesController(services.premisesService)

  return {
    premisesController,
  }
}

export { PremisesController }
