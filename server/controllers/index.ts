/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as apManageControllers } from './manage'
import { controllers as apApplyControllers } from './apply'

import type { Services } from '../services'

export const controllers = (services: Services) => {
  const applicationController = new ApplicationController()

  return {
    applicationController,
    approvedPremises: {
      ...apManageControllers(services),
      ...apApplyControllers(services),
    },
    temporaryAccommodation: {},
  }
}

export type Controllers = ReturnType<typeof controllers>
