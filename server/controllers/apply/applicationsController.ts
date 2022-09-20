import type { Request, Response, RequestHandler } from 'express'
import ApplicationService from '../../services/applicationService'
import { PersonService } from '../../services'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { formatDateString } from '../../utils/utils'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly personService: PersonService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationSummaries = await this.applicationService.tableRows(req.user.token)

      res.render('applications/list', { pageHeading: 'Approved Premises applications', applicationSummaries })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const person = await this.personService.findByCrn(req.user.token, crnArr[0])

        return res.render(`applications/confirm`, {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          dateOfBirth: formatDateString(person.dateOfBirth),
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        pageHeading: "Enter the individual's CRN",
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const uuid = await this.applicationService.createApplication(req.user.token)

      res.redirect(paths.applications.pages.show({ id: uuid, task: 'basic-information', page: 'sentence-type' }))
    }
  }
}
