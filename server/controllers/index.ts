/* istanbul ignore file */

import { controllers as taManageControllers } from './temporary-accommodation/manage'

import type { Services } from '../services'
import DashboardController from './dashboardController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    temporaryAccommodation: {
      ...taManageControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
