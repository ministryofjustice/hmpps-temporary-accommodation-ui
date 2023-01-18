/* istanbul ignore file */

import { controllers as taManageControllers } from './temporary-accommodation/manage'

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
      ...taManageControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
