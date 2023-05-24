import type { Request, RequestHandler, Response } from 'express'

import Apply from '../../form-pages/apply'
import paths from '../../paths/apply'
import { PersonService } from '../../services'
import ApplicationService from '../../services/applicationService'
import TasklistService from '../../services/tasklistService'
import { firstPageOfApplicationJourney, getResponses, isUnapplicable } from '../../utils/applicationUtils'
import { DateFormats } from '../../utils/dateUtils'
import extractCallConfig from '../../utils/restUtils'
import { fetchErrorsAndUserInput } from '../../utils/validation'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly personService: PersonService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const applications = await this.applicationService.getAllForLoggedInUser(callConfig)

      res.render('applications/index', { applications })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start')
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const application = await this.applicationService.getApplicationFromSessionOrAPI(callConfig, req)
      const taskList = new TasklistService(application)

      if (isUnapplicable(application)) {
        res.render('applications/notEligible')
      } else {
        res.render('applications/show', { application, taskList })
      }
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn') as string

      if (crnArr.length) {
        const crn = crnArr[0]
        const person = await this.personService.findByCrn(callConfig, crn)
        const offences = await this.personService.getOffences(callConfig, crn)

        const offenceId = offences.length === 1 ? offences[0].offenceId : null

        return res.render(`applications/people/confirm`, {
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { crn, offenceId } = req.body
      if (!offenceId) {
        res.redirect(paths.applications.people.selectOffence({ crn }))
      } else {
        const offences = await this.personService.getOffences(callConfig, crn)
        const indexOffence = offences.find(o => o.offenceId === offenceId)

        const application = await this.applicationService.createApplication(callConfig, crn, indexOffence)
        req.session.application = application

        res.redirect(firstPageOfApplicationJourney(application))
      }
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const application = await this.applicationService.findApplication(callConfig, req.params.id)
      application.document = getResponses(application)

      if (req.body?.confirmation !== 'submit') {
        const errorMessage = 'You must confirm the information provided is complete, accurate and up to date.'
        const errorObject = { text: errorMessage }

        return res.render('applications/show', {
          application,
          errorSummary: [
            {
              text: errorMessage,
              href: '#confirmation',
            },
          ],
          errorObject,
          sections: Apply.sections,
        })
      }

      await this.applicationService.submit(callConfig, application)
      return res.render('applications/confirm', { pageHeading: 'Application confirmation' })
    }
  }
}
