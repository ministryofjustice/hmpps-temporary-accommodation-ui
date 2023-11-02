/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'
import PeopleController from './peopleController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, personService, referenceDataService } = services
  const applicationsController = new ApplicationsController(applicationService, personService)
  const pagesController = new PagesController(applicationService, {
    personService,
    applicationService,
    referenceDataService,
  })
  const offencesController = new OffencesController(personService)
  const documentsController = new DocumentsController(personService)
  const peopleController = new PeopleController(personService)

  return {
    applicationsController,
    pagesController,
    offencesController,
    documentsController,
    peopleController,
  }
}

export { ApplicationsController }
