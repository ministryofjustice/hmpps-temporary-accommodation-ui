/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const applicationsController = new ApplicationsController(services.applicationService)
  const pagesController = new PagesController(services.applicationService)

  return {
    applicationsController,
    pagesController,
  }
}

export { ApplicationsController }
