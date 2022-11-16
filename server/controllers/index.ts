/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as taManageControllers } from './temporary-accommodation/manage'

import type { Services } from '../services'

export const controllers = (services: Services) => {
  const applicationController = new ApplicationController()

  return {
    applicationController,
    temporaryAccommodation: {
      ...taManageControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
