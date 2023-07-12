/* istanbul ignore file */

import { controllers as applyControllers } from './apply'
import { controllers as manageControllers } from './temporary-accommodation/manage'

import type { Services } from '../services'
import StaticController from './staticController'
import LandingController from './landingController'

export const controllers = (services: Services) => {
  const landingController = new LandingController()
  const staticController = new StaticController()

  return {
    landingController,
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
