/* istanbul ignore file */

import { controllers as applyControllers } from './apply'
import { controllers as manageControllers } from './temporary-accommodation/manage'

import type { Services } from '../services'
import StaticController from './staticController'
import LandingController from './landingController'
import RedirectsController from './redirectsController'

export const controllers = (services: Services) => {
  const landingController = new LandingController()
  const staticController = new StaticController()
  const redirectsController = new RedirectsController()

  return {
    landingController,
    redirectsController,
    staticController,
    manage: {
      ...manageControllers(services),
    },
    apply: {
      ...applyControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
