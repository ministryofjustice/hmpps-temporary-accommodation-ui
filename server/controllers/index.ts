/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as manageControllers } from './manage'

import type { Services } from '../services'

export const controllers = (services: Services) => {
  const applicationController = new ApplicationController()

  return {
    applicationController,
    ...manageControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
