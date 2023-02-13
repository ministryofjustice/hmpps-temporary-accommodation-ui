/* istanbul ignore file */

import { controllers as manageControllers } from './temporary-accommodation/manage'
import { controllers as applyControllers } from './apply'

import type { Services } from '../services'
import DashboardController from './dashboardController'
import StaticController from './staticController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const staticController = new StaticController()

  return {
    dashboardController,
    staticController,
    temporaryAccommodation: {
      ...manageControllers(services),
    },
    ...applyControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
