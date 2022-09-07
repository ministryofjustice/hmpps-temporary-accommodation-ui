/* istanbul ignore file */

import ApplicationsController from './applicationsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const applicationsController = new ApplicationsController(services.applicationService)
    applicationsController,
  }
}
export { ApplicationsController }
