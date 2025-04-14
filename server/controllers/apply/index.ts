/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import DeleteController from './applications/deleteController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'
import PeopleController from './peopleController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, timelineService, personService, referenceDataService } = services
  const applicationsController = new ApplicationsController(applicationService, timelineService, personService)
  const pagesController = new PagesController(applicationService, {
    personService,
    referenceDataService,
  })
  const offencesController = new OffencesController(personService)
  const documentsController = new DocumentsController(personService)
  const peopleController = new PeopleController(personService)
  const deleteController = new DeleteController(applicationService)

  return {
    applicationsController,
    deleteController,
    pagesController,
    offencesController,
    documentsController,
    peopleController,
  }
}

export { ApplicationsController }
