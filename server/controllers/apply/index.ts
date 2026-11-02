/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import DeleteController from './applications/deleteController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import PeopleController from './peopleController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, timelineService, personService, referenceDataService, formDataService } = services
  const applicationsController = new ApplicationsController(applicationService, timelineService, personService)
  const pagesController = new PagesController(applicationService, {
    personService,
    referenceDataService,
    formDataService
  })
  const offencesController = new OffencesController(personService)
  const peopleController = new PeopleController(personService)
  const deleteController = new DeleteController(applicationService)

  return {
    applicationsController,
    deleteController,
    pagesController,
    offencesController,
    peopleController,
  }
}

export { ApplicationsController }
